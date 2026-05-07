"use client";

import { useEffect } from "react";
import { getCurrentUser, refreshSession } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const refreshed = await refreshSession();
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setAuth(refreshed.accessToken, user);
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuth, setHydrated]);

  return <>{children}</>;
}
