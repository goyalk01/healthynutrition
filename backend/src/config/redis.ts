import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

const globalForRedis = globalThis as unknown as { redis?: Redis };

const createRedisClient = () => {
  const client = new Redis(env.REDIS_URL, {
    enableReadyCheck: true,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) {
        return null;
      }
      return Math.min(times * 200, 1000);
    },
  });

  let errorLogged = false;

  client.on("ready", () => {
    errorLogged = false;
  });

  client.on("error", (error) => {
    if (!errorLogged) {
      logger.warn("Redis unavailable; continuing with limited in-memory fallback");
      errorLogged = true;
    }
  });

  return client;
};

export const redis =
  globalForRedis.redis ??
  createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

let connectPromise: Promise<boolean> | null = null;

export const connectRedis = async (): Promise<boolean> => {
  if (redis.status === "ready" || redis.status === "connect") {
    return true;
  }

  if (redis.status === "end") {
    return false;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = redis
    .connect()
    .then(() => true)
    .catch(() => {
      logger.warn("Redis connection failed; using in-memory fallback where possible");
      return false;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
};
