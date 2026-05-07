import axios, { InternalAxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { APP_CONFIG } from "@/config/app";

/**
 * Server-side API client — request-scoped auth via cookies.
 *
 * CRITICAL SSR SAFETY:
 * - NO Zustand imports — Zustand stores are global singletons that would
 *   share state across concurrent server-side requests, leaking tokens
 *   between users.
 * - Auth is derived from the incoming request's cookies, ensuring
 *   per-request isolation.
 * - This client is safe for use in:
 *   - Server Components
 *   - Route Handlers
 *   - Server Actions
 *   - Middleware
 *
 * For client-side API calls with interceptors and refresh logic,
 * use client.browser.ts instead.
 */
const serverClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true,
  timeout: APP_CONFIG.apiTimeoutMs,
});

serverClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (allCookies) {
      config.headers.set("Cookie", allCookies);
    }
  } catch (error) {
    // next/headers cookies() cannot be used outside of Next.js Request context.
    // This is expected during build-time rendering or static generation.
  }

  return config;
});

export default serverClient;
