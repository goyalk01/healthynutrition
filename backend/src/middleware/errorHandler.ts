import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../utils/errors";
import { createErrorResponse } from "../utils/response";

/**
 * Global error handler.
 *
 * Maps error types to HTTP responses:
 * - ZodError   → 400 with field-level messages
 * - AppError   → uses the error's own statusCode and code
 * - 5xx        → generic message (never leak internals)
 * - Everything → includes requestId for tracing
 */
export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const requestId = request.requestId;

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    return reply.code(400).send(
      createErrorResponse(
        validationError.code,
        validationError.message,
        requestId,
      ),
    );
  }

  if (error instanceof AppError) {
    if (!error.isOperational) {
      request.log.error({ requestId, err: error }, "Non-operational error");
    }

    return reply
      .code(error.statusCode)
      .send(createErrorResponse(error.code, error.message, requestId));
  }

  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    request.log.error({ requestId, err: error }, "Unhandled server error");
    return reply
      .code(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", "Internal server error", requestId));
  }

  return reply
    .code(statusCode)
    .send(createErrorResponse("BAD_REQUEST", error.message || "Request failed", requestId));
};
