import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/app";
import { useAuthStore } from "@/store/authStore";
import { featureFlags } from "@/config/featureFlags";
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        if (featureFlags.useMockApi) {
          toast.info("Using mock API fallback (Timeout)");
          return Promise.resolve(handleMockApiResponse(error.config as InternalAxiosRequestConfig));
        }
        return Promise.reject(new Error("Request timed out. Please retry."));
      }

      if (error.code === "ERR_NETWORK") {
        if (featureFlags.useMockApi) {
          toast.info("Using mock API fallback (Network Error)");
          return Promise.resolve(handleMockApiResponse(error.config as InternalAxiosRequestConfig));
        }
        return Promise.reject(
          new Error(
            `API is unreachable at ${APP_CONFIG.apiBaseUrl}. Start backend and verify NEXT_PUBLIC_API_URL.`,
          ),
        );
      }

      if (featureFlags.useMockApi) {
         toast.info("Using mock API fallback");
         return Promise.resolve(handleMockApiResponse(error.config as InternalAxiosRequestConfig));
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
