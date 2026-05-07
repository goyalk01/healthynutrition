import { InternalError } from "./errors";

export const parseJsonArray = (value: unknown, label: string): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    throw new InternalError(`Corrupted ${label} payload`);
  }
};

export const parseJsonRecord = (
  value: unknown,
  label: string,
): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new InternalError(`Corrupted ${label} payload`);
  }
};
