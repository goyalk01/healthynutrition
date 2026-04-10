import Redis from "ioredis";
import { env } from "./env";
import { isRedisEnabled } from "./runtime";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

const createRedisClient = () =>
  new Redis(env.REDIS_URL as string, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: false,
  });

export const redis = isRedisEnabled
  ? globalForRedis.redis ?? createRedisClient()
  : null;

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
