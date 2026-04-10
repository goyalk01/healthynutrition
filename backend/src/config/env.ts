import { config } from "dotenv";
import { z } from "zod";

config();

const durationRegex = /^\d+[smhd]$/;
const hex64Regex = /^[a-fA-F0-9]{64}$/;

const DEFAULT_ACCESS_SECRET = "a3b5c7d9e1f34567a9b1c3d5e7f90123a4b6c8d0e2f45678a0b2c4d6e8f01234";
const DEFAULT_REFRESH_SECRET = "b4c6d8e0f2a45678b0c2d4e6f8012345b6d8f0a2c4e67890b1d3f5a7c9e10234";

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }

  return false;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL").optional(),
  PROTOTYPE_MODE: z.preprocess(parseBoolean, z.boolean()).default(false),
  JWT_ACCESS_SECRET: z
    .string()
    .regex(hex64Regex, "JWT_ACCESS_SECRET must be a 64-character hex string")
    .default(DEFAULT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: z
    .string()
    .regex(hex64Regex, "JWT_REFRESH_SECRET must be a 64-character hex string")
    .default(DEFAULT_REFRESH_SECRET),
  JWT_ACCESS_EXPIRES: z
    .string()
    .regex(durationRegex, "JWT_ACCESS_EXPIRES must look like '15m'")
    .default("15m"),
  JWT_REFRESH_EXPIRES: z
    .string()
    .regex(durationRegex, "JWT_REFRESH_EXPIRES must look like '7d'")
    .default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60000),
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
