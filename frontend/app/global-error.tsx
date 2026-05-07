"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-950/20">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-200">
            Critical application error
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            {error.message || "An unexpected error occurred while rendering the app."}
          </p>
          <button
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={reset}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
