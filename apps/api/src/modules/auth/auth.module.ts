import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaService } from "../../lib/prisma.service";
import { JwtBlacklistService } from "../../lib/jwt-blacklist.service";
import { RedisService } from "../../lib/redis.service";
import { AppMailService } from "../../mail/mail.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("app.jwt.accessSecret"),
        signOptions: {
          expiresIn: configService.get<string>("app.jwt.accessTtl")
        }
      }),
      inject: [ConfigService]
    }),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, JwtBlacklistService, RedisService, AppMailService],
  exports: [AuthService]
})
export class AuthModule {}
