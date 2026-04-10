import { FastifyPluginAsync } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "../config/env";
import { isRedisEnabled } from "../config/runtime";

export const rateLimiterPlugin: FastifyPluginAsync = async (fastify) => {
  if (env.NODE_ENV === "production") {
    if (!isRedisEnabled) {
      fastify.log.warn("REDIS_URL is missing, rate limiter disabled in production mode");
      return;
    }

    const { redis } = await import("../config/redis");
    if (!redis) {
      fastify.log.warn("Redis client unavailable, rate limiter disabled");
      return;
    }

    await fastify.register(fastifyRateLimit as any, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW,
      redis,
    });
    return;
  }

  await fastify.register(fastifyRateLimit as any, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });
};
