import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };
  }

  @Public()
  @Get("csrf")
  async csrf(@Req() req: Request) {
    return { token: req.csrfToken?.() };
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post("refresh")
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? res.req.cookies?.refreshToken;
    const tokens = await this.authService.refreshTokens({ refreshToken: token });
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Post("logout")
  async logout(@Body() dto: RefreshDto, @CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? res.req.cookies?.refreshToken;
    if (user?.tokenId) {
      await this.authService.blacklistAccessToken(user.tokenId);
    }
    await this.authService.logout({ refreshToken: token });
    res.clearCookie("refreshToken");
    return { success: true };
  }

  @Public()
  @Post("verify-email")
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post("forgot")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { success: true };
  }

  @Public()
  @Post("reset")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  }
}
