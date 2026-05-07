import pino, { Logger } from "pino";
import { env } from "../config/env";

/**
 * Centralized structured logger — pino-based with environment-aware configuration.
 *
 * Architecture:
 * - Base logger includes service name and environment in every log line
 * - Child loggers add correlation context (requestId, userId, jobId)
 * - Development: pino-pretty for human-readable output
 * - Production: JSON structured logs for Cloud Run / log aggregation
 *
 * Usage:
 *   logger.info("Server started");
 *   const reqLog = createChildLogger({ requestId: "abc-123" });
 *   reqLog.info("Processing request");
 */
export const logger: Logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  base: {
    service: env.APP_NAME,
    env: env.NODE_ENV,
    mode: env.APP_MODE,
  },
  // Redact sensitive fields from logs
  redact: {
    paths: ["password", "passwordHash", "accessToken", "refreshToken", "token", "authorization"],
    censor: "[REDACTED]",
  },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

/**
 * Create a child logger with additional correlation context.
 * Used for request-scoped or job-scoped logging.
 */
export const createChildLogger = (context: Record<string, unknown>): Logger =>
  logger.child(context);
