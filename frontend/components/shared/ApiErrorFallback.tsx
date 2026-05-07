"use client";

type ApiErrorFallbackProps = {
  /** Error message to display. */
  message?: string;
  /** Retry handler. */
  onRetry?: () => void;
};

/**
 * ApiErrorFallback — inline error state for failed API calls.
 *
 * Renders a compact error message with an optional retry button.
 * Used inside data-fetching components when React Query returns an error.
 */
export function ApiErrorFallback({
  message = "Failed to load data",
  onRetry,
}: ApiErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg
          className="h-5 w-5 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-red-800 dark:text-red-300">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
