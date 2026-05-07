/**
 * Test helpers — shared utilities for unit tests.
 *
 * These helpers make tests readable and DRY without pulling in
 * any real database or network dependencies.
 */

/**
 * Create a minimal mock user for testing.
 */
export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  passwordHash: "$2b$12$mockedHashValue.abcdefghijklmnopqrstuvwxyz12345",
  avatarUrl: null,
  age: 25,
  weight: 70,
  height: 175,
  activityLevel: "MODERATE",
  goal: "MAINTAIN",
  dailyCalorieTarget: 2000,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

/**
 * Create a minimal mock meal for testing.
 */
export const createMockMeal = (overrides: Record<string, unknown> = {}) => ({
  id: "test-meal-id",
  userId: "test-user-id",
  name: "Grilled Chicken Salad",
  description: "A healthy protein-rich salad",
  calories: 450,
  protein: 40,
  carbs: 20,
  fat: 22,
  fiber: 5,
  sugar: 3,
  mealType: "LUNCH",
  imageUrl: null,
  tags: "[]",
  isCustom: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

/**
 * Create a minimal mock habit for testing.
 */
export const createMockHabit = (overrides: Record<string, unknown> = {}) => ({
  id: "test-habit-id",
  userId: "test-user-id",
  name: "Drink Water",
  description: "Drink 8 glasses of water daily",
  category: "HYDRATION",
  frequency: "DAILY",
  targetCount: 8,
  unit: "glasses",
  isActive: true,
  createdAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

/**
 * Create a mock refresh token record.
 */
export const createMockRefreshToken = (overrides: Record<string, unknown> = {}) => ({
  id: "test-token-id",
  token: "hashed-refresh-token",
  userId: "test-user-id",
  expiresAt: new Date(Date.now() + 7 * 86_400_000),
  createdAt: new Date(),
  isRevoked: false,
  ...overrides,
});
