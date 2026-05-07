import apiClient from "@/shared/api/client";
import { unwrapApiResponse } from "@/shared/api/response";
import { ApiResponse } from "@/shared/types/api";
import {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types/auth.types";

export const loginRequest = async (payload: LoginPayload) => {
  const response = await apiClient.post<ApiResponse<AuthSession>>(
    "/auth/login",
    payload,
  );
  return unwrapApiResponse(response);
};

export const registerRequest = async (payload: RegisterPayload) => {
  const response = await apiClient.post<ApiResponse<AuthSession>>(
    "/auth/register",
    payload,
  );
  return unwrapApiResponse(response);
};

export const getCurrentUser = async () => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return unwrapApiResponse(response);
};

export const refreshSession = async () => {
  const response = await apiClient.post<
    ApiResponse<{ accessToken: string; refreshToken?: string }>
  >("/auth/refresh", {});
  return unwrapApiResponse(response);
};

export const logoutRequest = async () => {
  const response = await apiClient.post<ApiResponse<{ loggedOut: true }>>(
    "/auth/logout",
    {},
  );
  return unwrapApiResponse(response);
};
