export const API_PREFIX = "/api/v1";

export const COOKIE_KEYS = {
  refreshToken: "refreshToken",
} as const;

export const API_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_EXISTS: "Email already registered",
  SESSION_EXPIRED: "Session expired",
  UNAUTHORIZED: "Unauthorized",
} as const;
