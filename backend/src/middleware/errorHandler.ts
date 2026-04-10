import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { createErrorResponse } from "../utils/response";

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof ZodError) {
    return reply.code(400).send(
      createErrorResponse(
        "VALIDATION_ERROR",
        error.issues.map((issue) => issue.message).join(", "),
      ),
    );
  }

  const statusCode = error.statusCode ?? 500;
  const code =
    statusCode === 401
      ? "UNAUTHORIZED"
      : statusCode === 403
        ? "FORBIDDEN"
        : statusCode === 404
          ? "NOT_FOUND"
          : statusCode === 409
            ? "CONFLICT"
            : "INTERNAL_SERVER_ERROR";

  return reply
    .code(statusCode)
    .send(createErrorResponse(code, error.message || "Internal server error"));
};
