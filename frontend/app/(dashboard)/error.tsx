"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardErrorBoundary]", error);
  }, [error]);

  return (
    <ErrorState
      title="Dashboard rendering failed"
      description={error.message || "Something failed while rendering the dashboard."}
      retryLabel="Reload dashboard"
      onRetry={reset}
    />
  );
}
