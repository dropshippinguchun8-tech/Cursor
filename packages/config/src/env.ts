import { z } from "zod";

export const commonEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url(),
  EMAIL_FROM: z.string().email(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string()
});

export const apiEnvSchema = commonEnvSchema.extend({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  MAILPIT_PORT: z.coerce.number().optional(),
  ENABLE_2FA: z.enum(["true", "false"]).default("false")
});

export const webEnvSchema = commonEnvSchema.extend({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("CPAMaRKeT.Uz")
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

export function validateApiEnv(env: NodeJS.ProcessEnv): ApiEnv {
  const parsed = apiEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error("Invalid API environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid API environment variables");
  }

  return parsed.data;
}

export function validateWebEnv(env: NodeJS.ProcessEnv): WebEnv {
  const parsed = webEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error("Invalid Web environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid Web environment variables");
  }

  return parsed.data;
}
