import { FastifyPluginAsync } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "../config/env";

export const rateLimiterPlugin: FastifyPluginAsync = async (fastify) => {
  if (env.NODE_ENV === "production") {
    const { redis } = await import("../config/redis");
    await fastify.register(fastifyRateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW,
      redis,
    });
    return;
  }

  await fastify.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });
};
