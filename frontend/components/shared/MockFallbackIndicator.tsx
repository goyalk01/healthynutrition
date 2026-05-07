"use client";

import { featureFlags } from "@/config/featureFlags";
import { useDevRuntimeStore } from "@/store/devRuntimeStore";

export function MockFallbackIndicator() {
  const mockFallbackActive = useDevRuntimeStore(
    (state) => state.mockFallbackActive,
  );

  if (!featureFlags.isDevelopmentMode || !mockFallbackActive) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/60 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-900 shadow-sm dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-100">
      Mock fallback active
    </span>
  );
}