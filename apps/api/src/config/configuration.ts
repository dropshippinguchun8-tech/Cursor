import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  emailFrom: process.env.EMAIL_FROM ?? "no-reply@cpamarket.uz",
  smtp: {
    host: process.env.SMTP_HOST ?? "localhost",
    port: parseInt(process.env.SMTP_PORT ?? "1025", 10),
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? ""
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET ?? "accesssecret",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "refreshsecret",
    accessTtl: "15m",
    refreshTtl: "7d"
  },
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "",
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET_KEY ?? "",
    bucket: process.env.S3_BUCKET ?? "cpamarket-assets"
  },
  enable2fa: process.env.ENABLE_2FA === "true"
}));
