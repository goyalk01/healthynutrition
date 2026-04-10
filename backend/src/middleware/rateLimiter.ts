import { FastifyPluginAsync } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "../config/env";
import { redis } from "../config/redis";

export const rateLimiterPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    redis,
  });
};
