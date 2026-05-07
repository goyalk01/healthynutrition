"use client";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Unable to load this section",
  description = "Please try again. If the issue persists, refresh the page.",
  retryLabel = "Retry",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <svg
          className="h-6 w-6"
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
      <div>
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">{title}</h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
