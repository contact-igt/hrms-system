import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env"),
  quiet: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(5000),
  WEB_URL: z.url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("14d"),
  JWT_ISSUER: z.string().default("hrms-api"),
  JWT_AUDIENCE: z.string().default("hrms-web"),
  REFRESH_COOKIE_NAME: z.string().default("hrms_refresh"),

  OTP_SECRET: z.string().min(24),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),
  RESET_TICKET_EXPIRES_IN_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15),
  INVITATION_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("Orbix HRMS <no-reply@example.com>"),

  PLATFORM_ADMIN_EMAIL: z.email().optional(),
  PLATFORM_ADMIN_PASSWORD: z.string().min(12).optional(),
  PLATFORM_ADMIN_FIRST_NAME: z.string().default("Platform"),
  PLATFORM_ADMIN_LAST_NAME: z.string().default("Admin"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed.");
}

export const env = parsed.data;
