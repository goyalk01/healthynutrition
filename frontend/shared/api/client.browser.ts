"use client";

/**
 * Browser-only API client.
 *
 * CRITICAL: This file MUST remain client-only ("use client").
 * It uses Zustand for auth state which would leak between requests
 * if executed during SSR. For server-side API calls, use client.server.ts.
 */
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/app";
import { useAuthStore } from "@/store/authStore";
import { featureFlags } from "@/config/featureFlags";
import { createDemoAuthSession } from "@/features/auth/mockSession";
import { useDevRuntimeStore } from "@/store/devRuntimeStore";
import { handleMockApiResponse } from "./mockApi";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true,
  timeout: APP_CONFIG.apiTimeoutMs,
});

const refreshClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true,
  timeout: APP_CONFIG.apiTimeoutMs,
});

let refreshPromise: Promise<string | null> | null = null;
let mockFallbackLogged = false;

const markMockFallback = (
  reason: string,
  config: InternalAxiosRequestConfig,
) => {
  useDevRuntimeStore.getState().markBackendUnreachable(reason);
  if (!mockFallbackLogged) {
    console.warn(
      "[NutriSense][MockFallback] Backend unreachable; switching to local mock responses.",
      { method: config.method, url: config.url, reason },
    );
    mockFallbackLogged = true;
  }
};

const withAuthHeader = (
  config: InternalAxiosRequestConfig,
  token: string,
): InternalAxiosRequestConfig => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : AxiosHeaders.from(config.headers || {});

  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await refreshClient.post("/auth/refresh", {});
        const accessToken = response.data?.data?.accessToken as string | undefined;

        if (!accessToken) {
          throw new Error("Missing access token in refresh response");
        }

        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      } catch {
        if (featureFlags.useMockApi && featureFlags.autoDemoLogin) {
          const session = createDemoAuthSession();
          useAuthStore.getState().setAuth(session.accessToken, session.user);
          return session.accessToken;
        }

        useAuthStore.getState().markSessionExpired();
        if (typeof window !== "undefined") {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    return config;
  }

  return withAuthHeader(config, token);
});

apiClient.interceptors.response.use(
  (response) => {
    if (featureFlags.useMockApi) {
      useDevRuntimeStore.getState().markBackendReachable();
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!error.response) {
      if (featureFlags.useMockApi) {
        const fallbackConfig =
          (error.config as InternalAxiosRequestConfig | undefined) ??
          ({
            method: "get",
            url: "",
            headers: new AxiosHeaders(),
          } as InternalAxiosRequestConfig);

        markMockFallback(error.code || "ERR_NETWORK", fallbackConfig);
        return Promise.resolve(handleMockApiResponse(fallbackConfig));
      }

      if (error.code === "ECONNABORTED") {
        return Promise.reject(new Error("Request timed out. Please retry."));
      }

      if (error.code === "ERR_NETWORK") {
        return Promise.reject(
          new Error(
            `API is unreachable at ${APP_CONFIG.apiBaseUrl}. Start backend and verify NEXT_PUBLIC_API_URL.`,
          ),
        );
      }

      return Promise.reject(new Error("Network request failed. Please retry."));
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response.status === 401;
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

    if (!isUnauthorized || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    const retriedRequest = withAuthHeader(originalRequest, newAccessToken);
    return apiClient(retriedRequest);
  },
);

export default apiClient;
