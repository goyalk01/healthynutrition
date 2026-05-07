import { create } from "zustand";

type DevRuntimeState = {
  backendReachable: boolean;
  mockFallbackActive: boolean;
  lastFallbackReason: string | null;
  markBackendReachable: () => void;
  markBackendUnreachable: (reason: string) => void;
  reset: () => void;
};

export const useDevRuntimeStore = create<DevRuntimeState>((set) => ({
  backendReachable: true,
  mockFallbackActive: false,
  lastFallbackReason: null,

  markBackendReachable: () =>
    set({
      backendReachable: true,
      mockFallbackActive: false,
      lastFallbackReason: null,
    }),

  markBackendUnreachable: (reason) =>
    set({
      backendReachable: false,
      mockFallbackActive: true,
      lastFallbackReason: reason,
    }),

  reset: () =>
    set({
      backendReachable: true,
      mockFallbackActive: false,
      lastFallbackReason: null,
    }),
}));
