import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { FastifyInstance } from "fastify";
import { API_PREFIX } from "./config/constants";
import { prisma } from "./config/database";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { registerSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiterPlugin } from "./middleware/rateLimiter";
import { requestLoggerPlugin } from "./middleware/requestLogger";
import authRoutes from "./modules/auth/auth.routes";
import habitsRoutes from "./modules/habits/habits.routes";
import logsRoutes from "./modules/logs/logs.routes";
import mealsRoutes from "./modules/meals/meals.routes";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes";
import usersRoutes from "./modules/users/users.routes";
import { createSuccessResponse } from "./utils/response";
import { recommendationsQueue } from "./modules/recommendations/recommendations.queue";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info",
    },
    trustProxy: true,
    /** Production safety: cap request body size to prevent OOM attacks. */
    bodyLimit: env.MAX_BODY_SIZE,
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production"
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
          },
        }
      : false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie);
  await app.register(requestLoggerPlugin);
  await app.register(rateLimiterPlugin);

  // OpenAPI documentation at /docs
  await registerSwagger(app);

  app.setErrorHandler(errorHandler);

  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Liveness check",
      },
    },
    async (request) => {
      return createSuccessResponse({
        status: "ok",
        service: env.APP_NAME,
        timestamp: new Date().toISOString(),
      }, undefined, request.requestId);
    },
  );

  app.get(
    "/ready",
    {
      schema: {
        tags: ["Health"],
        summary: "Readiness check — verifies database, Redis, and queue health",
      },
    },
    async (_request, reply) => {
      const checks = {
        database: false,
        redis: redis.status === "ready",
        queue: false,
      };

      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = true;
      } catch {
        checks.database = false;
      }

      // Queue health — check if the queue is connected and operational
      if (recommendationsQueue) {
        try {
          await recommendationsQueue.getJobCounts();
          checks.queue = true;
        } catch {
          checks.queue = false;
        }
      } else {
        // No queue in dev mode — not a failure
        checks.queue = true;
      }

      const allHealthy = checks.database && checks.redis && checks.queue;

      if (!allHealthy) {
        return reply.code(503).send(createSuccessResponse({
          status: "degraded",
          checks,
        }, undefined, _request.requestId));
      }

      return createSuccessResponse({
        status: "ready",
        checks,
      }, undefined, _request.requestId);
    },
  );

  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(usersRoutes, { prefix: `${API_PREFIX}/users` });
  await app.register(mealsRoutes, { prefix: `${API_PREFIX}/meals` });
  await app.register(habitsRoutes, { prefix: `${API_PREFIX}/habits` });
  await app.register(logsRoutes, { prefix: API_PREFIX });
  await app.register(recommendationsRoutes, { prefix: `${API_PREFIX}/recommendations` });

  // Log startup summary
  app.log.info(
    {
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      appMode: env.APP_MODE,
      port: env.PORT,
      bodyLimit: `${Math.round(env.MAX_BODY_SIZE / 1024)}KB`,
      docs: `/docs`,
      healthCheck: `/health`,
      readinessCheck: `/ready`,
    },
    "Application configured",
  );

  return app;
};
