import { create } from "zustand";
import { AuthUser } from "@/types/auth.types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  sessionExpired: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
  markSessionExpired: () => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  hydrated: false,
  sessionExpired: false,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      sessionExpired: false,
    }),

  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && state.user),
      sessionExpired: false,
    })),

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: Boolean(state.accessToken && user),
      sessionExpired: false,
    })),

  setHydrated: (hydrated) =>
    set({
      hydrated,
    }),

  markSessionExpired: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      sessionExpired: true,
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      sessionExpired: false,
    }),
}));
