import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import { addDays, addMinutes, isAfter } from "date-fns";
import { v4 as uuid } from "uuid";
import * as argon2 from "argon2";
import { PrismaService } from "../../lib/prisma.service";
import { JwtBlacklistService } from "../../lib/jwt-blacklist.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AppMailService } from "../../mail/mail.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshTtl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly blacklist: JwtBlacklistService,
    private readonly mail: AppMailService
  ) {
    this.refreshSecret = this.configService.get<string>("app.jwt.refreshSecret") ?? "refreshsecret";
    this.refreshTtl = this.configService.get<string>("app.jwt.refreshTtl") ?? "7d";
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase()
      }
    });

    if (existing) {
      throw new BadRequestException({ title: "EmailTaken", detail: "Email already registered" });
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        passwordHash,
        role: dto.role as UserRole,
        status: "pending",
        referralCode: dto.role === UserRole.targetolog ? uuid() : undefined,
        profile: {
          create: {
            fullName: dto.fullName,
            phone: dto.phone,
            telegram: dto.telegram,
            language: dto.language ?? "uz",
            timezone: dto.timezone ?? "Asia/Tashkent"
          }
        }
      },
      include: {
        profile: true
      }
    });

    await this.generateEmailVerification(user.id);
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status === "suspended") {
      throw new UnauthorizedException("Account suspended");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), status: user.status === "pending" ? "active" : user.status }
    });

    return this.issueTokens(user.id, user.role);
  }

  async refreshTokens(dto: RefreshDto): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.refreshSecret
      });

      const stored = await this.prisma.refreshToken.findUnique({
        where: { id: payload.jti }
      });

      if (!stored || stored.revoked || isAfter(new Date(), stored.expiresAt)) {
        throw new UnauthorizedException("Refresh token invalid");
      }

      return this.issueTokens(payload.sub, payload.role, stored.id);
    } catch (error) {
      throw new UnauthorizedException("Refresh token invalid");
    }
  }

  async logout(dto: RefreshDto) {
    if (!dto.refreshToken) {
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.refreshSecret
      });
      if (payload?.jti) {
        await this.prisma.refreshToken.update({
          where: { id: payload.jti },
          data: { revoked: true }
        });
        await this.blacklist.blacklist(payload.jti, 60 * 60 * 24 * 7);
      }
    } catch {
      // ignore invalid token on logout
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { token: dto.token },
      include: { user: true }
    });
    if (!token || token.usedAt || isAfter(new Date(), token.expiresAt)) {
      throw new BadRequestException("Invalid verification token");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { status: "active" }
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { verified: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });
    if (!user) {
      return;
    }

    const token = await this.prisma.passwordResetToken.create({
      data: {
        token: uuid(),
        userId: user.id,
        expiresAt: addDays(new Date(), 1)
      }
    });

    await this.mail.sendPasswordReset(user.email, token.token);
    return token;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true }
    });

    if (!token || token.usedAt || isAfter(new Date(), token.expiresAt)) {
      throw new BadRequestException("Invalid reset token");
    }

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { reset: true };
  }

  private async issueTokens(userId: string, role: UserRole, reuseTokenId?: string): Promise<AuthTokens> {
    const jti = reuseTokenId ?? uuid();
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        role
      },
      {
        jwtid: uuid()
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        role,
        jti
      },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshTtl
      }
    );

    const expiresAt = addDays(new Date(), 7);
    const refreshTokenRecord = await this.prisma.refreshToken.upsert({
      where: { id: jti },
      create: {
        id: jti,
        userId,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt
      },
      update: {
        tokenHash: await argon2.hash(refreshToken),
        revoked: false,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenId: refreshTokenRecord.id,
      expiresIn: 15 * 60
    };
  }

  private async generateEmailVerification(userId: string) {
    const token = uuid();
    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt: addMinutes(new Date(), 60)
      }
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    if (user?.email) {
      await this.mail.sendVerificationEmail(user.email, token);
    }
    return token;
  }

  async blacklistAccessToken(tokenId: string, ttlSeconds = 60 * 15) {
    if (!tokenId) {
      return;
    }
    await this.blacklist.blacklist(tokenId, ttlSeconds);
  }
}
