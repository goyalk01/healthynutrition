import {
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError, ApiResponse, ApiSuccess } from "../types/api";

export const createApiSuccessResponse = <T>(
  data: T,
  message = "Success",
): ApiSuccess<T> => ({
  success: true,
  data,
  message,
});

export const createApiErrorResponse = (
  code: string,
  message: string,
): ApiError => ({
  success: false,
  error: {
    code,
    message,
  },
});

type AxiosMockResponseOptions = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string> | AxiosHeaders;
  request?: unknown;
};

const toAxiosHeaders = (
  headers?: Record<string, string> | AxiosHeaders,
): AxiosHeaders => {
  if (!headers) {
    return new AxiosHeaders();
  }
  return headers instanceof AxiosHeaders ? headers : AxiosHeaders.from(headers);
};

export const createAxiosMockResponse = <T>(
  config: InternalAxiosRequestConfig,
  payload: ApiResponse<T>,
  options: AxiosMockResponseOptions = {},
): AxiosResponse<ApiResponse<T>> => ({
  data: payload,
  status: options.status ?? (payload.success ? 200 : 400),
  statusText: options.statusText ?? (payload.success ? "OK" : "Bad Request"),
  headers: toAxiosHeaders(options.headers),
  config,
  request: options.request ?? { mocked: true },
});

export const unwrapApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  const body = response?.data as ApiResponse<T> | undefined;
  if (!body || typeof body !== "object" || !("success" in body)) {
    throw new Error("Invalid API response shape");
  }

  if (!body.success) {
    throw new Error(body.error?.message || "API request failed");
  }

  if (body.data === undefined) {
    throw new Error("Invalid API success response: missing data");
  }

  return body.data;
};
