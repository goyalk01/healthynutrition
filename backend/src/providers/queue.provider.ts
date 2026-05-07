import { Queue, QueueOptions } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../utils/logger";
import { featureFlags } from "../config/featureFlags";

/**
 * Queue provider — factory for BullMQ queues with environment-safe fallback.
 *
 * Architecture:
 * - Production: creates real BullMQ queues backed by Redis
 * - Development (no Redis): returns null (callers must null-check)
 * - Mock detection uses feature flags, never fragile toString() hacks
 *
 * Why null instead of a mock queue:
 * A mock queue that silently swallows jobs masks infrastructure failures.
 * Null forces callers to explicitly handle the no-queue case, making the
 * fallback path visible and testable.
 */

/** Check if the Redis client is a development dummy (no real connection). */
const isDummyRedis = (): boolean => {
  // In development mode without requireRedis, if REDIS_URL is absent
  // the redis.ts module creates a stub object. Check for that.
  if (featureFlags.requireRedis) return false;
  // The dummy client has status hardcoded to "ready" as a plain string property
  // but lacks a real connect method. Use constructor name as a reliable check.
  return redis.constructor.name === "Object";
};

export const createQueue = <T = unknown>(name: string): Queue<T> | null => {
  if (isDummyRedis()) {
    logger.info({ queue: name }, "[Queue] Skipped — no Redis in development mode");
    return null;
  }

  const queueOptions: QueueOptions = {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: { count: 1000, age: 24 * 3600 }, // keep last 1k or 24h
      removeOnFail: { count: 5000 },                      // keep failures for debugging
    },
  };

  logger.info({ queue: name }, "[Queue] Created BullMQ queue");
  return new Queue<T>(name, queueOptions);
};
