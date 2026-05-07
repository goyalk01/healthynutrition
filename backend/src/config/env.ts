import { config } from "dotenv";
import { z } from "zod";

config();

const durationRegex = /^\d+[smhd]$/;
const hex64Regex = /^[a-fA-F0-9]{64}$/;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_MODE: z.enum(["development", "production"]).default("development"),
  APP_NAME: z.string().min(1).default("nutrisense-api"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .regex(hex64Regex, "JWT_ACCESS_SECRET must be a 64-character hex string"),
  JWT_REFRESH_SECRET: z
    .string()
    .regex(hex64Regex, "JWT_REFRESH_SECRET must be a 64-character hex string"),
  JWT_ACCESS_EXPIRES: z
    .string()
    .regex(durationRegex, "JWT_ACCESS_EXPIRES must look like '15m'"),
  JWT_REFRESH_EXPIRES: z
    .string()
    .regex(durationRegex, "JWT_REFRESH_EXPIRES must look like '7d'"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60000),
}).superRefine((data, ctx) => {
  if (data.APP_MODE === "production" && !data.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "DATABASE_URL is required in production mode",
      path: ["DATABASE_URL"],
    });
  }
  if (data.APP_MODE === "production" && !data.REDIS_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "REDIS_URL is required in production mode",
      path: ["REDIS_URL"],
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue: { path: (string | number)[]; message: string }) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
