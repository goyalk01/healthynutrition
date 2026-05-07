"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppErrorBoundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-6">
      <ErrorState
        title="Something went wrong"
        description={error.message || "An unexpected error occurred."}
        retryLabel="Try again"
        onRetry={reset}
      />
    </div>
  );
}
