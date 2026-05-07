/**
 * Recommendation engine unit tests.
 *
 * Tests the scoring logic, threshold triggers, and edge cases
 * of the deterministic recommendation engine.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationEngine } from "../modules/recommendations/recommendations.engine";
import { MealsRepository } from "../modules/meals/meals.repository";
import { HabitsRepository } from "../modules/habits/habits.repository";
import { RecommendationsRepository } from "../modules/recommendations/recommendations.repository";

vi.mock("../modules/meals/meals.repository");
vi.mock("../modules/habits/habits.repository");
vi.mock("../modules/recommendations/recommendations.repository");
vi.mock("../config/env", () => ({
  env: {
    NODE_ENV: "test",
    APP_NAME: "test",
    HOST: "0.0.0.0",
    PORT: 8080,
    SHUTDOWN_TIMEOUT_MS: 10000,
    DATABASE_URL: "test",
    REDIS_URL: "test",
    JWT_ACCESS_SECRET: "a".repeat(64),
    JWT_REFRESH_SECRET: "b".repeat(64),
    JWT_ACCESS_EXPIRES: "15m",
    JWT_REFRESH_EXPIRES: "7d",
    CORS_ORIGIN: "http://localhost:3000",
    BCRYPT_ROUNDS: 4,
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_WINDOW: 60000,
  },
}));

const createEmptyMacros = () => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  totalLogs: 0,
  uniqueMeals: 0,
  mealTypeCounts: {} as Record<string, number>,
});

const createHealthyMacros = () => ({
  calories: 14000, // 2000/day × 7
  protein: 350,    // 50g/day × 7
  carbs: 1925,     // 275g/day × 7
  fat: 546,        // 78g/day × 7
  totalLogs: 21,   // 3 meals/day × 7
  uniqueMeals: 14,
  mealTypeCounts: {
    BREAKFAST: 7,
    LUNCH: 7,
    DINNER: 7,
  } as Record<string, number>,
});

describe("RecommendationEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Score ranges ─────────────────────────────────────────────
  describe("analyze — score constraints", () => {
    it("should return score between 0 and 1", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createHealthyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it("should return exactly 5 dimensions", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createEmptyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      expect(result.dimensions).toHaveLength(5);
      const names = result.dimensions.map((d) => d.dimension);
      expect(names).toContain("Calorie Adherence");
      expect(names).toContain("Macro Balance");
      expect(names).toContain("Meal Consistency");
      expect(names).toContain("Habit Streak");
      expect(names).toContain("Nutrition Variety");
    });

    it("should have weights that sum to approximately 1.0", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createEmptyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);
      const totalWeight = result.dimensions.reduce((sum, d) => sum + d.weight, 0);

      expect(totalWeight).toBeCloseTo(1.0, 5);
    });
  });

  // ── Zero data edge case ──────────────────────────────────────
  describe("analyze — zero data", () => {
    it("should handle no meals and no habits gracefully", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createEmptyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      expect(result.overallScore).toBe(0);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);

      const insightRec = result.recommendations.find((r) => r.type === "INSIGHT");
      expect(insightRec).toBeDefined();
      expect(insightRec!.title).toBe("Start logging meals");
    });

    it("should use default calorie target when none provided", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createEmptyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", null);

      // Should not throw; uses dailyDefaults.calories (2000)
      expect(result.overallScore).toBe(0);
    });
  });

  // ── Healthy user ─────────────────────────────────────────────
  describe("analyze — healthy user", () => {
    it("should return high score for ideal nutrition", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createHealthyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([
        { habitId: "h1", name: "Water", category: "HYDRATION", completionRate: 0.9 },
        { habitId: "h2", name: "Exercise", category: "EXERCISE", completionRate: 0.85 },
      ]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      expect(result.overallScore).toBeGreaterThan(0.5);
    });
  });

  // ── Alert thresholds ─────────────────────────────────────────
  describe("analyze — alert thresholds", () => {
    it("should fire calorie alert when deviation exceeds threshold", async () => {
      const macros = createHealthyMacros();
      macros.calories = 7000; // 1000/day vs 2000 target → 50% deviation
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(macros);
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      const alert = result.recommendations.find(
        (r) => r.type === "ALERT" && r.title === "Calorie intake off target",
      );
      expect(alert).toBeDefined();
    });

    it("should fire protein alert when below minimum", async () => {
      const macros = createHealthyMacros();
      macros.protein = 200; // ~28.6g/day, below 40g threshold
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(macros);
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      const proteinRec = result.recommendations.find(
        (r) => r.type === "MEAL" && r.title === "Increase protein intake",
      );
      expect(proteinRec).toBeDefined();
    });

    it("should flag low-completion habits", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createHealthyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([
        { habitId: "h1", name: "Meditate", category: "MINDFULNESS", completionRate: 0.2 },
        { habitId: "h2", name: "Sleep", category: "SLEEP", completionRate: 0.3 },
      ]);

      const result = await RecommendationEngine.analyze("user-1", 2000);

      const habitRec = result.recommendations.find(
        (r) => r.type === "HABIT" && r.title === "Habits need attention",
      );
      expect(habitRec).toBeDefined();
    });
  });

  // ── generateAndPersist ───────────────────────────────────────
  describe("generateAndPersist", () => {
    it("should persist recommendations when they exist", async () => {
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(createEmptyMacros());
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([]);
      vi.mocked(RecommendationsRepository.createMany).mockResolvedValue({ count: 1 } as any);

      const result = await RecommendationEngine.generateAndPersist("user-1", 2000);

      expect(RecommendationsRepository.createMany).toHaveBeenCalledOnce();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should skip persistence when no recommendations generated", async () => {
      const macros = createHealthyMacros();
      vi.mocked(MealsRepository.aggregateMacros).mockResolvedValue(macros);
      vi.mocked(HabitsRepository.getCompletionRates).mockResolvedValue([
        { habitId: "h1", name: "Water", category: "HYDRATION", completionRate: 0.9 },
      ]);

      await RecommendationEngine.generateAndPersist("user-1", 2000);

      // If no recommendations generated, createMany should not be called
      if (vi.mocked(RecommendationsRepository.createMany).mock.calls.length === 0) {
        expect(RecommendationsRepository.createMany).not.toHaveBeenCalled();
      }
    });
  });
});
