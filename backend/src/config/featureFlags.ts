import { env } from "./env";

/**
 * Feature flags — environment-driven capability toggles.
 *
 * Architecture:
 * - All flags are derived from APP_MODE (never individual env vars)
 * - Production mode ALWAYS enables all safety features
 * - Development mode provides maximum DX velocity
 *
 * Production invariants (enforced at startup):
 * - Mock data/auth MUST be disabled
 * - Database and Redis MUST be required
 * - Rate limiting MUST be enabled
 * - Secure cookies MUST be enabled
 */
export const featureFlags = {
  get isDevelopmentMode() {
    return env.APP_MODE === "development";
  },
  get isProductionMode() {
    return env.APP_MODE === "production";
  },
  get useMockData() {
    return env.APP_MODE === "development";
  },
  get useMockAuth() {
    return env.APP_MODE === "development";
  },
  get requireDatabase() {
    return env.APP_MODE === "production";
  },
  get requireRedis() {
    return env.APP_MODE === "production";
  },
  get useSecureCookies() {
    return env.APP_MODE === "production";
  },
  get useRateLimiting() {
    return env.APP_MODE === "production";
  },
  get enforceCSP() {
    return env.APP_MODE === "production";
  },
};

/**
 * Validate production safety invariants at startup.
 * Throws if any invariant is violated — prevents deploying with unsafe config.
 *
 * This is called during server startup, NOT at import time,
 * so tests and dev mode are unaffected.
 */
export const assertProductionSafety = (): void => {
  if (env.APP_MODE !== "production") return;

  const violations: string[] = [];

  if (featureFlags.useMockData) {
    violations.push("Mock data providers are enabled in production");
  }
  if (featureFlags.useMockAuth) {
    violations.push("Mock auth is enabled in production");
  }
  if (!featureFlags.requireDatabase) {
    violations.push("Database is not required in production");
  }
  if (!featureFlags.requireRedis) {
    violations.push("Redis is not required in production");
  }
  if (!featureFlags.useRateLimiting) {
    violations.push("Rate limiting is disabled in production");
  }
  if (!featureFlags.useSecureCookies) {
    violations.push("Secure cookies are disabled in production");
  }

  if (violations.length > 0) {
    throw new Error(
      `PRODUCTION SAFETY VIOLATION:\n${violations.map((v) => `  ✗ ${v}`).join("\n")}\n\nThis is a critical configuration error. Fix APP_MODE or environment variables.`,
    );
  }
};
