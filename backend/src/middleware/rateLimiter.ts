import { FastifyPluginAsync } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "../config/env";
import { connectRedis, redis } from "../config/redis";

export const rateLimiterPlugin: FastifyPluginAsync = async (fastify) => {
  const redisReady = await connectRedis();

  if (!redisReady) {
    fastify.log.warn("Redis is unavailable; rate limiter is using in-memory storage");
  }

  await fastify.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    ...(redisReady ? { redis } : {}),
  });
};
