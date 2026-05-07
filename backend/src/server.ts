import { prisma } from "./config/database";
import { env } from "./config/env";
import { connectRedis, redis } from "./config/redis";
import { buildApp } from "./app";

let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;
let shuttingDown = false;

const shutdown = async (signal: string, exitCode = 0) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  const timeout = setTimeout(() => {
    console.error("Forced shutdown — timeout exceeded");
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);

  try {
    if (appInstance) {
      appInstance.log.info({ signal }, "Graceful shutdown initiated");
      await appInstance.close();
      appInstance.log.info("HTTP server closed");
    }
    await prisma.$disconnect();
    if (redis.status === "ready" || redis.status === "connect") {
      await redis.quit();
    }
  } finally {
    clearTimeout(timeout);
    process.exit(exitCode);
  }
};

void (async () => {
  const startTime = performance.now();

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
  appInstance?.log.error({ err: error }, "Uncaught exception");
  void shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  appInstance?.log.error({ reason }, "Unhandled rejection");
  void shutdown("unhandledRejection", 1);
});

