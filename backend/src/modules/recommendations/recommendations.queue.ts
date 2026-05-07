import { createQueue } from "../../providers/queue.provider";

/**
 * Recommendation queue — typed job payloads for BullMQ.
 *
 * Job deduplication:
 * Each job is keyed by `rec:${userId}` so that rapid successive meal/habit
 * logs for the same user collapse into a single recommendation run.
 * BullMQ's `jobId` ensures only one pending job per user exists at a time.
 */

export type RecommendationJobData = {
  userId: string;
  userCalorieTarget?: number | null;
  persist: boolean;
  /** ISO timestamp of the triggering event (for tracing). */
  triggeredAt: string;
};

export const RECOMMENDATIONS_QUEUE_NAME = "recommendations";

/** Job name constants for type-safe job dispatch. */
export const RECOMMENDATION_JOBS = {
  GENERATE: "generate-recommendation",
} as const;

export const recommendationsQueue = createQueue<RecommendationJobData>(RECOMMENDATIONS_QUEUE_NAME);

/**
 * Dispatch a recommendation generation job with built-in deduplication.
 *
 * Why deduplication matters:
 * A user logging 5 meals in quick succession should NOT trigger 5 separate
 * recommendation engine runs. Using `jobId: rec:${userId}` with a debounce
 * delay ensures only the last event within the window is processed.
 */
export const enqueueRecommendation = async (data: RecommendationJobData): Promise<void> => {
  if (!recommendationsQueue) {
    // Development mode — no Redis, no queue. Recommendations are generated
    // synchronously via the generate endpoint instead.
    return;
  }

  await recommendationsQueue.add(RECOMMENDATION_JOBS.GENERATE, data, {
    jobId: `rec:${data.userId}`,
    delay: 2000, // 2s debounce — coalesces rapid successive events
    removeOnComplete: { count: 500 },
  });
};
