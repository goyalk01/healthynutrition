"use client";

import { featureFlags } from "@/config/featureFlags";
import { BackendStatusIndicator } from "./BackendStatusIndicator";
import { MockFallbackIndicator } from "./MockFallbackIndicator";

export function ModeIndicator() {
  if (!featureFlags.isDevelopmentMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
      <BackendStatusIndicator />
      <MockFallbackIndicator />
      <span className="text-muted-foreground">
        DEV MODE {featureFlags.useMockApi && <span className="font-semibold text-primary">(MOCK API)</span>}
      </span>
    </div>
  );
}
