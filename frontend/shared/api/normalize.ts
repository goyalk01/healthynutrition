import { PaginatedResult } from "../types/api";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asNonNegativeNumber = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return fallback;
  }
  return value;
};

export const normalizeArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

export const normalizeObject = <T extends Record<string, unknown>>(
  value: unknown,
): T | null => {
  return isRecord(value) ? (value as T) : null;
};

export const normalizeNullable = <T>(value: T | null | undefined): T | null => {
  return value ?? null;
};

export const normalizePaginated = <T>(value: unknown): PaginatedResult<T> => {
  if (!isRecord(value)) {
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  const items = normalizeArray<T>((value as { items?: unknown }).items);
  const paginationRaw = (value as { pagination?: unknown }).pagination;
  const pagination = isRecord(paginationRaw) ? paginationRaw : {};

  return {
    items,
    pagination: {
      page: asNonNegativeNumber(pagination.page, 1),
      limit: asNonNegativeNumber(pagination.limit, 20),
      total: asNonNegativeNumber(pagination.total, items.length),
      totalPages: asNonNegativeNumber(pagination.totalPages, items.length ? 1 : 0),
    },
  };
};
