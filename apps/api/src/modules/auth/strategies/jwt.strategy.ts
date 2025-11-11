import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../lib/prisma.service";
import { JwtBlacklistService } from "../../../lib/jwt-blacklist.service";

export interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly blacklist: JwtBlacklistService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("app.jwt.accessSecret")
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    if (payload.jti && (await this.blacklist.isBlacklisted(payload.jti))) {
      throw new UnauthorizedException("Token revoked");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        username: true
      }
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, tokenId: payload.jti };
  }
}
