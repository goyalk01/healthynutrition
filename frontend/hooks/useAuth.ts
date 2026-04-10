"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { AuthTokens, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth.types";

type AuthResponse = AuthTokens & { user: AuthUser };

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post("/auth/login", payload);
      return response.data.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success("Welcome back");
    },
  });

  const register = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await api.post("/auth/register", payload);
      return response.data.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success("Account created");
    },
  });

  return { login, register };
};
