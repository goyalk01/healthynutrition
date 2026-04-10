import { useAuthStore } from "@/store/authStore";

export const getAccessToken = (): string | null => useAuthStore.getState().accessToken;

export const setAccessToken = (token: string | null) => {
  const store = useAuthStore.getState();
  if (token) {
    store.setAccessToken(token);
    return;
  }

  store.clearAuth();
};
