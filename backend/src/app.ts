import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { FastifyInstance } from "fastify";
import { API_PREFIX } from "./config/constants";
import { env } from "./config/env";
import { isDatabaseEnabled, isPrototypeMode, isRedisEnabled } from "./config/runtime";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiterPlugin } from "./middleware/rateLimiter";
import { requestLoggerPlugin } from "./middleware/requestLogger";
import authRoutes from "./modules/auth/auth.routes";
import habitsRoutes from "./modules/habits/habits.routes";
import logsRoutes from "./modules/logs/logs.routes";
import mealsRoutes from "./modules/meals/meals.routes";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes";
import usersRoutes from "./modules/users/users.routes";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors as any, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie);
  await app.register(requestLoggerPlugin);
  await app.register(rateLimiterPlugin);

  app.setErrorHandler(errorHandler);

  app.log.info({
    prototypeMode: isPrototypeMode,
    databaseEnabled: isDatabaseEnabled,
    redisEnabled: isRedisEnabled,
  }, "Runtime mode initialized");

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "nutrisense-api",
      timestamp: new Date().toISOString(),
    };
  });

  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(usersRoutes, { prefix: `${API_PREFIX}/users` });
  await app.register(mealsRoutes, { prefix: `${API_PREFIX}/meals` });
  await app.register(habitsRoutes, { prefix: `${API_PREFIX}/habits` });
  await app.register(logsRoutes, { prefix: API_PREFIX });
  await app.register(recommendationsRoutes, { prefix: `${API_PREFIX}/recommendations` });

  return app;
};

if (require.main === module) {
  void (async () => {
    const app = await buildApp();
    try {
      await app.listen({
        host: "0.0.0.0",
        port: Number(process.env.PORT ?? env.PORT),
      });
    } catch (error) {
      app.log.error(error);
      process.exit(1);
    }
  })();
}
