import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { MailerModule } from "@nestjs-modules/mailer";
import configuration from "./config/configuration";
import { PrismaService } from "./lib/prisma.service";
import { RedisService } from "./lib/redis.service";
import { JwtBlacklistService } from "./lib/jwt-blacklist.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { OffersModule } from "./modules/offers/offers.module";
import { ProductsModule } from "./modules/products/products.module";
import { CreativesModule } from "./modules/creatives/creatives.module";
import { ClicksModule } from "./modules/clicks/clicks.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { StatsModule } from "./modules/stats/stats.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { PayoutsModule } from "./modules/payouts/payouts.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { AuditModule } from "./modules/audit/audit.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100
      }
    ]),
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        return {
          connection: redisUrl
            ? {
                url: redisUrl,
                lazyConnect: true
              }
            : {
                host: "localhost",
                port: 6379,
                lazyConnect: true
              }
        };
      }
    }),
    MailerModule.forRootAsync({
      useFactory: () => {
        const host = process.env.SMTP_HOST;
        if (!host) {
          return {
            transport: {
              jsonTransport: true
            },
            defaults: {
              from: process.env.EMAIL_FROM ?? "no-reply@cpamarket.uz"
            }
          };
        }

        return {
          transport: {
            host,
            port: Number(process.env.SMTP_PORT ?? 1025),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
            }
          },
          defaults: {
            from: process.env.EMAIL_FROM
          }
        };
      }
    }),
    AuthModule,
    UsersModule,
    OffersModule,
    ProductsModule,
    CreativesModule,
    ClicksModule,
    LeadsModule,
    StatsModule,
    CampaignsModule,
    PayoutsModule,
    NotificationsModule,
    TicketsModule,
    AuditModule,
    UploadsModule
  ],
  providers: [
    PrismaService,
    RedisService,
    JwtBlacklistService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ]
})
export class AppModule {}
