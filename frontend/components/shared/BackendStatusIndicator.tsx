"use client";

import { featureFlags } from "@/config/featureFlags";
import { useDevRuntimeStore } from "@/store/devRuntimeStore";

export function BackendStatusIndicator() {
  const backendReachable = useDevRuntimeStore((state) => state.backendReachable);

  if (!featureFlags.isDevelopmentMode) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-amber-900 shadow-sm backdrop-blur dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <span
        className={`h-2 w-2 rounded-full ${
          backendReachable ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        }`}
      />
      Backend {backendReachable ? "online" : "offline"}
    </span>
  );
}