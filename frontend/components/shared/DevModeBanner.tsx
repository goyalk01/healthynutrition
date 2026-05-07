"use client";

import { useEffect } from "react";
import { APP_CONFIG } from "@/config/app";
import { featureFlags } from "@/config/featureFlags";
import { useDevRuntimeStore } from "@/store/devRuntimeStore";
import { BackendStatusIndicator } from "./BackendStatusIndicator";
import { MockFallbackIndicator } from "./MockFallbackIndicator";

export function DevModeBanner() {
  const backendReachable = useDevRuntimeStore((state) => state.backendReachable);
  const markBackendReachable = useDevRuntimeStore((state) => state.markBackendReachable);
  const markBackendUnreachable = useDevRuntimeStore((state) => state.markBackendUnreachable);

  useEffect(() => {
    if (!featureFlags.showDevRuntimeBanner) {
      return;
    }

    const apiRoot = APP_CONFIG.apiBaseUrl.replace(/\/api\/v\d+$/, "");
    const healthUrl = `${apiRoot}/health`;

    const checkBackend = async () => {
      try {
        const response = await fetch(healthUrl, { method: "GET", cache: "no-store" });
        if (response.ok) {
          markBackendReachable();
          return;
        }
        markBackendUnreachable(`HEALTH_STATUS_${response.status}`);
      } catch {
        markBackendUnreachable("HEALTH_UNREACHABLE");
      }
    };

    void checkBackend();
    const interval = setInterval(() => {
      void checkBackend();
    }, 15000);

    return () => clearInterval(interval);
  }, [markBackendReachable, markBackendUnreachable]);

  if (!featureFlags.showDevRuntimeBanner) {
    return null;
  }

  return (
    <div className="border-b border-amber-300/50 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <span className="font-semibold">Development Mode</span>
        <BackendStatusIndicator />
        <MockFallbackIndicator />
        {!backendReachable && (
          <span className="font-medium">
            ⚠ Backend unreachable — using local mock data
          </span>
        )}
      </div>
    </div>
  );
}
