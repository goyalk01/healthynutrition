"use client";

import { useEffect, useState } from "react";
import { featureFlags } from "@/config/featureFlags";
import { APP_CONFIG } from "@/config/app";

export function ModeIndicator() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!featureFlags.isDevelopmentMode) return;

    const checkBackend = async () => {
      try {
        const res = await fetch(`${APP_CONFIG.apiBaseUrl}/health`, { method: "GET" });
        setIsBackendOnline(res.ok);
      } catch {
        setIsBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!featureFlags.isDevelopmentMode) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
      <div
        className={`h-2 w-2 rounded-full ${
          isBackendOnline === true
            ? "bg-green-500"
            : isBackendOnline === false
            ? "bg-red-500 animate-pulse"
            : "bg-yellow-500 animate-pulse"
        }`}
        title={isBackendOnline ? "Backend Online" : "Backend Offline"}
      />
      <span className="text-muted-foreground">
        DEV MODE {featureFlags.useMockApi && <span className="font-semibold text-primary">(MOCK API)</span>}
      </span>
    </div>
  );
}
