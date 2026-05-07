"use client";

import { type ReactNode } from "react";

type EmptyStateProps = {
  /** Icon component rendered in the centered circle. */
  icon?: ReactNode;
  /** Primary heading. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Optional CTA button. */
  action?: ReactNode;
};

/**
 * EmptyState — reusable "nothing here yet" pattern.
 *
 * Used across meals, habits, recommendations, and logs pages when
 * there is no data to display. Provides a consistent, polished UX
 * instead of blank screens.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/30">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
