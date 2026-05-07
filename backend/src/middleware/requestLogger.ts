import crypto from "crypto";
import { FastifyPluginAsync } from "fastify";

/**
 * Request logger with distributed tracing and observability.
 *
 * Every request gets a unique requestId (forwarded from X-Request-ID header
 * or generated) and a high-resolution timer for latency measurement.
 * Logs include: method, URL, status, duration, response size, and user context.
 * This enables end-to-end request tracing in Cloud Run logs.
 */
export const requestLoggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request) => {
    const incomingId = request.headers["x-request-id"];
    request.requestId =
      typeof incomingId === "string" && incomingId.length > 0
        ? incomingId
        : crypto.randomUUID();
    request.startTime = process.hrtime.bigint();

    request.log.info(
      {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers["user-agent"],
        ip: request.ip,
      },
      "→ request",
    );
  });

  fastify.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.requestId);
    return payload;
  });

  fastify.addHook("onResponse", async (request, reply) => {
    const durationMs = Number(process.hrtime.bigint() - request.startTime) / 1e6;
    const contentLength = reply.getHeader("content-length");

    request.log.info(
      {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        responseBytes: contentLength ? Number(contentLength) : undefined,
        userId: request.user?.userId,
      },
      "← response",
    );
  });
};

