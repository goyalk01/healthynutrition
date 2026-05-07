import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { logger } from "../../utils/logger";
import { featureFlags } from "../../config/featureFlags";
import { RECOMMENDATIONS_QUEUE_NAME, RecommendationJobData } from "./recommendations.queue";
import { RecommendationEngine } from "./recommendations.engine";

/**
 * Recommendation worker — processes background recommendation generation jobs.
 *
 * Architecture:
 * - Runs in the same process as the HTTP server (modular monolith)
 * - Uses BullMQ's concurrency control to limit parallel processing
 * - Structured logging with job-level tracing for observability
 * - Graceful shutdown via closeRecommendationWorker()
 *
 * Scaling path:
 * When the modular monolith outgrows single-process workers, extract this
 * into a separate Node.js process using the same queue name. BullMQ handles
 * distributed job locking automatically.
 */

let worker: Worker | null = null;

const isDummyRedis = (): boolean => {
  if (featureFlags.requireRedis) return false;
  return redis.constructor.name === "Object";
};

export const startRecommendationWorker = () => {
  if (isDummyRedis()) {
    logger.info(`[Worker] Skipping — no Redis in development mode`);
    return;
  }

  worker = new Worker<RecommendationJobData>(
    RECOMMENDATIONS_QUEUE_NAME,
    async (job: Job<RecommendationJobData>) => {
      const startMs = performance.now();
      const jobLog = logger.child({
        worker: RECOMMENDATIONS_QUEUE_NAME,
        jobId: job.id,
        userId: job.data.userId,
        attempt: job.attemptsMade + 1,
      });

      jobLog.info("Processing recommendation job");

      try {
        if (job.data.persist) {
          const result = await RecommendationEngine.generateAndPersist(
            job.data.userId,
            job.data.userCalorieTarget,
          );
          jobLog.info(
            {
              durationMs: Math.round(performance.now() - startMs),
              recommendations: result.recommendations.length,
              overallScore: result.overallScore,
            },
            "Recommendation job completed",
          );
        } else {
          await RecommendationEngine.analyze(job.data.userId, job.data.userCalorieTarget);
          jobLog.info(
            { durationMs: Math.round(performance.now() - startMs) },
            "Analysis job completed (no persist)",
          );
        }
      } catch (error) {
        const durationMs = Math.round(performance.now() - startMs);
        jobLog.error(
          { err: error, durationMs },
          "Recommendation job failed",
        );
        throw error; // Re-throw so BullMQ triggers retry with backoff
      }
    },
    {
      connection: redis,
      concurrency: 5,
      // Stalled job detection — if a job doesn't report progress within
      // this interval, BullMQ considers it stalled and retries it.
      stalledInterval: 30_000,
    },
  );

  worker.on("error", (err) => {
    logger.error({ err, worker: RECOMMENDATIONS_QUEUE_NAME }, "[Worker] Unhandled worker error");
  });

  worker.on("failed", (job, err) => {
    logger.warn(
      {
        jobId: job?.id,
        userId: job?.data?.userId,
        attempts: job?.attemptsMade,
        err,
      },
      "[Worker] Job failed after retries",
    );
  });

  logger.info({ queue: RECOMMENDATIONS_QUEUE_NAME, concurrency: 5 }, "[Worker] Started");
};

export const closeRecommendationWorker = async () => {
  if (worker) {
    logger.info("[Worker] Shutting down recommendation worker...");
    await worker.close();
    worker = null;
    logger.info("[Worker] Recommendation worker stopped");
  }
};
