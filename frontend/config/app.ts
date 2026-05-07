export const APP_CONFIG = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080/api/v1",
  apiTimeoutMs: 10_000,
} as const;
