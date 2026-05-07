/**
 * Config-driven nutrition intelligence.
 *
 * All AI scoring weights, thresholds, and rules live here.
 * To tune recommendations, change this config — never the engine code.
 *
 * Architecture: the recommendation engine reads these weights at runtime
 * to produce deterministic, explainable scores.
 */

export const NUTRITION_CONFIG = {
  /** Daily recommended intakes (defaults; overridden by user profile). */
  dailyDefaults: {
    calories: 2000,
    proteinGrams: 50,
    carbsGrams: 275,
    fatGrams: 78,
    fiberGrams: 28,
    sugarGrams: 50,
    waterLiters: 2.5,
  },

  /** Scoring weights for the recommendation engine (must sum to 1.0). */
  scoringWeights: {
    macroBalance: 0.30,
    calorieAdherence: 0.25,
    mealConsistency: 0.20,
    habitStreak: 0.15,
    nutritionVariety: 0.10,
  },

  /** Thresholds that trigger recommendation alerts. */
  alertThresholds: {
    /** Fire an alert if actual calories deviate more than this % from target. */
    calorieDeviationPercent: 20,
    /** Minimum protein intake (grams) before flagging deficit. */
    proteinMinimumGrams: 40,
    /** Days without logging meals before sending a nudge. */
    inactiveDays: 3,
    /** Minimum water intake (liters) before flagging dehydration risk. */
    waterMinimumLiters: 1.5,
  },

  /** Macro ratio targets (percentage of total calories). */
  macroRatios: {
    protein: { min: 0.10, ideal: 0.30, max: 0.40 },
    carbs: { min: 0.30, ideal: 0.45, max: 0.60 },
    fat: { min: 0.20, ideal: 0.25, max: 0.35 },
  },

  varietyTargets: {
    uniqueMealsPerWeek: 14,
    mealTypeCoveragePercent: 0.7,
  },

  /** Scoring brackets for individual dimensions. */
  scoringBrackets: {
    excellent: 0.9,
    good: 0.7,
    fair: 0.5,
    poor: 0.3,
  },
} as const;

export type NutritionConfig = typeof NUTRITION_CONFIG;
