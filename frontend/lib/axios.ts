import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10_000,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10_000,
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

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    return config;
  }

  return withAuthHeader(config, token);
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!error.response) {
      return Promise.reject(new Error("Network timeout. Please retry."));
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
    return api(retriedRequest);
  },
);

export default api;
