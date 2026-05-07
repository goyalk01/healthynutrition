/**
 * Utility function unit tests.
 *
 * Validates JSON parsers, pagination builder, and error hierarchy.
 */
import { describe, it, expect } from "vitest";
import { parseJsonArray, parseJsonRecord } from "../utils/json";
import { buildPaginationMeta } from "../utils/pagination";
import {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitedError,
  InternalError,
} from "../utils/errors";

// ── JSON parsers ─────────────────────────────────────────────
describe("parseJsonArray", () => {
  it("should pass through arrays directly", () => {
    expect(parseJsonArray(["a", "b"], "test")).toEqual(["a", "b"]);
  });

  it("should parse valid JSON string arrays", () => {
    expect(parseJsonArray('["x","y"]', "test")).toEqual(["x", "y"]);
  });

  it("should return empty array for non-string, non-array", () => {
    expect(parseJsonArray(null, "test")).toEqual([]);
    expect(parseJsonArray(undefined, "test")).toEqual([]);
    expect(parseJsonArray(42, "test")).toEqual([]);
  });

  it("should return empty array for non-array JSON", () => {
    expect(parseJsonArray('{"key":"val"}', "test")).toEqual([]);
  });

  it("should throw InternalError for corrupted JSON", () => {
    expect(() => parseJsonArray("{invalid", "test")).toThrow("Corrupted test payload");
  });
});

describe("parseJsonRecord", () => {
  it("should pass through objects directly", () => {
    const obj = { a: 1, b: "c" };
    expect(parseJsonRecord(obj, "test")).toEqual(obj);
  });

  it("should parse valid JSON strings", () => {
    expect(parseJsonRecord('{"key":"val"}', "test")).toEqual({ key: "val" });
  });

  it("should return empty object for non-string, non-object", () => {
    expect(parseJsonRecord(null, "test")).toEqual({});
    expect(parseJsonRecord(42, "test")).toEqual({});
  });

  it("should return empty object for arrays", () => {
    expect(parseJsonRecord([1, 2], "test")).toEqual({});
    expect(parseJsonRecord("[1,2]", "test")).toEqual({});
  });

  it("should throw InternalError for corrupted JSON", () => {
    expect(() => parseJsonRecord("{bad json", "test")).toThrow("Corrupted test payload");
  });
});

// ── Pagination ───────────────────────────────────────────────
describe("buildPaginationMeta", () => {
  it("should compute totalPages correctly", () => {
    const meta = buildPaginationMeta(1, 10, 95);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(10);
    expect(meta.total).toBe(95);
    expect(meta.totalPages).toBe(10);
  });

  it("should handle zero results", () => {
    const meta = buildPaginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
  });

  it("should handle exact page boundaries", () => {
    const meta = buildPaginationMeta(1, 10, 30);
    expect(meta.totalPages).toBe(3);
  });
});

// ── Error hierarchy ──────────────────────────────────────────
describe("Error hierarchy", () => {
  it("should set correct status codes", () => {
    expect(new BadRequestError().statusCode).toBe(400);
    expect(new ValidationError().statusCode).toBe(400);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ConflictError().statusCode).toBe(409);
    expect(new RateLimitedError().statusCode).toBe(429);
    expect(new InternalError().statusCode).toBe(500);
  });

  it("should set correct error codes", () => {
    expect(new BadRequestError().code).toBe("BAD_REQUEST");
    expect(new NotFoundError().code).toBe("NOT_FOUND");
    expect(new InternalError().code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should be instances of AppError", () => {
    const errors = [
      new BadRequestError(),
      new ValidationError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new NotFoundError(),
      new ConflictError(),
      new RateLimitedError(),
      new InternalError(),
    ];

    errors.forEach((err) => {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(Error);
    });
  });

  it("should mark operational vs non-operational", () => {
    expect(new NotFoundError().isOperational).toBe(true);
    expect(new InternalError().isOperational).toBe(false);
  });

  it("should support custom resource messages for NotFoundError", () => {
    expect(new NotFoundError("Meal").message).toBe("Meal not found");
    expect(new NotFoundError("User", "Custom message").message).toBe("Custom message");
  });
});
