/**
 * Centralized application constants.
 *
 * ALL magic strings and business defaults live here.
 * Never hardcode limits, labels, or keys in services or controllers.
 */

export const API_PREFIX = "/api/v1";

export const COOKIE = {
  refreshToken: "refreshToken",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const SEARCH = {
  maxResults: 25,
} as const;

export const API_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_EXISTS: "Email already registered",
  SESSION_EXPIRED: "Session expired",
  UNAUTHORIZED: "Unauthorized",
  USER_NOT_FOUND: "User not found",
  MEAL_NOT_FOUND: "Meal not found",
  HABIT_NOT_FOUND: "Habit not found",
  RECOMMENDATION_NOT_FOUND: "Recommendation not found",
} as const;

export const ACTIVITY_LEVELS = [
  "SEDENTARY",
  "LIGHT",
  "MODERATE",
  "ACTIVE",
  "VERY_ACTIVE",
] as const;

export const GOALS = [
  "LOSE_WEIGHT",
  "GAIN_MUSCLE",
  "MAINTAIN",
  "IMPROVE_ENERGY",
] as const;

export const MEAL_TYPES = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "PRE_WORKOUT",
  "POST_WORKOUT",
] as const;

export const HABIT_CATEGORIES = [
  "HYDRATION",
  "SLEEP",
  "EXERCISE",
  "NUTRITION",
  "MINDFULNESS",
] as const;

export const HABIT_FREQUENCIES = ["DAILY", "WEEKLY"] as const;

export const MOOD_LEVELS = [
  "GREAT",
  "GOOD",
  "NEUTRAL",
  "BAD",
  "TERRIBLE",
] as const;

export const RECOMMENDATION_TYPES = [
  "MEAL",
  "HABIT",
  "INSIGHT",
  "ALERT",
] as const;

export const RATE_LIMIT = {
  authMax: 10,
  authWindow: "1 minute",
} as const;
