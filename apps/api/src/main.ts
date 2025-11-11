import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { json, urlencoded } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { PrismaService } from "./lib/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"]
  });
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>("APP_BASE_URL"),
    credentials: true
  });
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true }));
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: configService.get("NODE_ENV") === "production"
      }
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true
    })
  );
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = configService.get<number>("PORT") ?? 4000;
  await app.listen(port);
  logger.log(`🚀 CPAMaRKeT.Uz API running on http://0.0.0.0:${port}/api`);
}

bootstrap();
