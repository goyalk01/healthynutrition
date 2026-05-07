import { prisma } from "./config/database";
import { env } from "./config/env";
import { connectRedis, redis } from "./config/redis";
import { buildApp } from "./app";
import { startRecommendationWorker, closeRecommendationWorker } from "./modules/recommendations/recommendations.worker";
import { assertProductionSafety } from "./config/featureFlags";
import { logger } from "./utils/logger";


let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;
let shuttingDown = false;

const shutdown = async (signal: string, exitCode = 0) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  const timeout = setTimeout(() => {
    logger.error("Forced shutdown — timeout exceeded");
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);

  try {
    if (appInstance) {
      appInstance.log.info({ signal }, "Graceful shutdown initiated");
      await appInstance.close();
      appInstance.log.info("HTTP server closed");
    }

    // Close workers before disconnecting Redis (workers depend on Redis)
    await closeRecommendationWorker();

    await prisma.$disconnect();
    logger.info("PostgreSQL disconnected");

    if (redis.status === "ready" || redis.status === "connect") {
      await redis.quit();
      logger.info("Redis disconnected");
    }
  } finally {
    clearTimeout(timeout);
    process.exit(exitCode);
  }
};

void (async () => {
  const startTime = performance.now();

  // ── Production safety gate ──────────────────────────────
  // This MUST run before anything else. If production invariants
  // are violated (mock auth enabled, missing infra, etc.), the
  // server will refuse to start rather than serve traffic unsafely.
  assertProductionSafety();

  const app = await buildApp();
  appInstance = app;

  try {
    // ── Startup validation ─────────────────────────────────
    app.log.info("Connecting to PostgreSQL...");
    await prisma.$connect();
    app.log.info("✓ PostgreSQL connected");

    app.log.info("Connecting to Redis...");
    const redisReady = await connectRedis();
    app.log.info(
      redisReady ? "✓ Redis connected" : "⚠ Redis unavailable (using fallback)",
    );

    app.log.info("Starting workers...");
    startRecommendationWorker();

    // ── Start listening ────────────────────────────────────
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    const startupMs = Math.round(performance.now() - startTime);

    app.log.info(
      {
        startupMs,
        port: env.PORT,
        env: env.NODE_ENV,
        appMode: env.APP_MODE,
        docs: `http://localhost:${env.PORT}/docs`,
      },
      `🚀 NutriSense API ready in ${startupMs}ms`,
    );
  } catch (error) {
    app.log.error(error, "Server startup failed");
    await prisma.$disconnect();
    process.exit(1);
  }
})();

process.on("SIGTERM", () => {
  void shutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
  void shutdown("SIGINT", 0);
});

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
  void shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
  void shutdown("unhandledRejection", 1);
});
