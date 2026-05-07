"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { loginRequest, registerRequest } from "../api/auth.api";
import { LoginPayload, RegisterPayload } from "../types/auth.types";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = useMutation({
    mutationFn: async (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success("Welcome back");
    },
  });

  const register = useMutation({
    mutationFn: async (payload: RegisterPayload) => registerRequest(payload),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success("Account created");
    },
  });

  return { login, register };
};
