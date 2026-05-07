/**
 * Enterprise error class hierarchy.
 *
 * All domain errors extend AppError so the global error handler can
 * introspect them uniformly.  Using concrete subclasses avoids magic
 * status-code numbers scattered through business logic.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(400, "VALIDATION_ERROR", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", message?: string) {
    super(404, "NOT_FOUND", message ?? `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests") {
    super(429, "RATE_LIMITED", message);
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_SERVER_ERROR", message, false);
  }
}
