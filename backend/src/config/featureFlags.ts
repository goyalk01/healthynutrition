import { env } from "./env";

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
