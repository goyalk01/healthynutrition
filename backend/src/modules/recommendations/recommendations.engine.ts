import { NUTRITION_CONFIG } from "../../config/nutrition";
import { MEAL_TYPES } from "../../config/constants";
import { MealsRepository } from "../meals/meals.repository";
import { HabitsRepository } from "../habits/habits.repository";
import { RecommendationsRepository } from "./recommendations.repository";

/**
 * Recommendation engine — config-driven, explainable, deterministic.
 *
 * Architecture:
 * 1. Gather user data (macros, habit completion, meal frequency)
 * 2. Score each dimension using NUTRITION_CONFIG weights
 * 3. Generate recommendations with explainable reasoning
 * 4. Persist via repository
 *
 * To tune: change NUTRITION_CONFIG values. Never change this engine logic.
 */

export type DimensionScore = {
  dimension: string;
  score: number;
  weight: number;
  weighted: number;
  explanation: string;
};

export type RecommendationEngineResult = {
  overallScore: number;
  dimensions: DimensionScore[];
  recommendations: GeneratedRecommendation[];
};

export type GeneratedRecommendation = {
  type: "MEAL" | "HABIT" | "INSIGHT" | "ALERT";
  title: string;
  description: string;
  score: number;
  data: Record<string, unknown>;
};

const { scoringWeights, alertThresholds, macroRatios, dailyDefaults, varietyTargets } =
  NUTRITION_CONFIG;

export class RecommendationEngine {
  /**
   * Analyze a user's nutrition and habits, returning scored recommendations.
   */
  static async analyze(
    userId: string,
    userCalorieTarget?: number | null,
  ): Promise<RecommendationEngineResult> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

    const [macros, habitRates] = await Promise.all([
      MealsRepository.aggregateMacros(userId, sevenDaysAgo),
      HabitsRepository.getCompletionRates(userId, sevenDaysAgo),
    ]);

    const target = userCalorieTarget ?? dailyDefaults.calories;
    const dimensions: DimensionScore[] = [];
    const recommendations: GeneratedRecommendation[] = [];

    // ── Dimension 1: Calorie Adherence ────────────────────────
    const dailyAvgCalories = macros.totalLogs > 0 ? macros.calories / 7 : 0;
    const calorieDeviation = target > 0
      ? Math.abs(dailyAvgCalories - target) / target
      : 1;
    const calorieScore = Math.max(0, 1 - calorieDeviation);

    dimensions.push({
      dimension: "Calorie Adherence",
      score: calorieScore,
      weight: scoringWeights.calorieAdherence,
      weighted: calorieScore * scoringWeights.calorieAdherence,
      explanation:
        dailyAvgCalories === 0
          ? "No meals logged this week"
          : `Avg ${Math.round(dailyAvgCalories)} kcal/day vs ${target} target (${Math.round(calorieDeviation * 100)}% deviation)`,
    });

    if (calorieDeviation > alertThresholds.calorieDeviationPercent / 100) {
      recommendations.push({
        type: "ALERT",
        title: "Calorie intake off target",
        description: `Your average intake is ${Math.round(dailyAvgCalories)} kcal/day, which is ${Math.round(calorieDeviation * 100)}% away from your ${target} kcal target.`,
        score: 1 - calorieScore,
        data: { dailyAvgCalories: Math.round(dailyAvgCalories), target, deviation: Math.round(calorieDeviation * 100) },
      });
    }

    // ── Dimension 2: Macro Balance ────────────────────────────
    const totalMacroCalories =
      macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
    let macroScore = 0;

    if (totalMacroCalories > 0) {
      const proteinRatio = (macros.protein * 4) / totalMacroCalories;
      const carbsRatio = (macros.carbs * 4) / totalMacroCalories;
      const fatRatio = (macros.fat * 9) / totalMacroCalories;

      const proteinDev = Math.abs(proteinRatio - macroRatios.protein.ideal);
      const carbsDev = Math.abs(carbsRatio - macroRatios.carbs.ideal);
      const fatDev = Math.abs(fatRatio - macroRatios.fat.ideal);

      macroScore = Math.max(0, 1 - (proteinDev + carbsDev + fatDev));
    }

    dimensions.push({
      dimension: "Macro Balance",
      score: macroScore,
      weight: scoringWeights.macroBalance,
      weighted: macroScore * scoringWeights.macroBalance,
      explanation:
        totalMacroCalories === 0
          ? "No macro data available"
          : `P:${Math.round((macros.protein * 4 / totalMacroCalories) * 100)}% C:${Math.round((macros.carbs * 4 / totalMacroCalories) * 100)}% F:${Math.round((macros.fat * 9 / totalMacroCalories) * 100)}%`,
    });

    // ── Dimension 3: Meal Consistency ─────────────────────────
    const consistencyScore = Math.min(1, macros.totalLogs / 21); // 3 meals × 7 days

    dimensions.push({
      dimension: "Meal Consistency",
      score: consistencyScore,
      weight: scoringWeights.mealConsistency,
      weighted: consistencyScore * scoringWeights.mealConsistency,
      explanation: `${macros.totalLogs} meals logged in 7 days (target: 21)`,
    });

    if (macros.totalLogs === 0) {
      recommendations.push({
        type: "INSIGHT",
        title: "Start logging meals",
        description: "Log your meals to get personalized nutrition insights and recommendations.",
        score: 0.9,
        data: { totalLogs: 0 },
      });
    }

    // ── Dimension 4: Habit Streak ─────────────────────────────
    const avgHabitCompletion =
      habitRates.length > 0
        ? habitRates.reduce((sum, h) => sum + h.completionRate, 0) / habitRates.length
        : 0;

    dimensions.push({
      dimension: "Habit Streak",
      score: avgHabitCompletion,
      weight: scoringWeights.habitStreak,
      weighted: avgHabitCompletion * scoringWeights.habitStreak,
      explanation:
        habitRates.length === 0
          ? "No active habits"
          : `${Math.round(avgHabitCompletion * 100)}% average completion across ${habitRates.length} habits`,
    });

    const lowHabits = habitRates
      .filter((h) => h.completionRate < 0.5)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (lowHabits.length > 0) {
      recommendations.push({
        type: "HABIT",
        title: "Habits need attention",
        description: `${lowHabits.map((h) => h.name).join(", ")} ${lowHabits.length === 1 ? "is" : "are"} below 50% completion.`,
        score: 0.7,
        data: { lowHabits: lowHabits.map((h) => ({ name: h.name, rate: Math.round(h.completionRate * 100) })) },
      });
    }

    // ── Dimension 5: Nutrition Variety ─────────────────────────
    const mealTypeCount = Object.keys(macros.mealTypeCounts).length;
    const typeCoverage = mealTypeCount / MEAL_TYPES.length;
    const mealTypeCountsValues = Object.values(macros.mealTypeCounts) as number[];
    const totalTypeLogs = mealTypeCountsValues.reduce(
      (sum, count) => sum + count,
      0,
    );
    const evenness =
      totalTypeLogs === 0
        ? 0
        : 1 -
          mealTypeCountsValues
            .map((count) => count / totalTypeLogs)
            .reduce((sum, ratio) => sum + ratio * ratio, 0);
    const uniqueMealScore = Math.min(1, macros.uniqueMeals / varietyTargets.uniqueMealsPerWeek);
    const coverageScore = Math.min(1, typeCoverage / varietyTargets.mealTypeCoveragePercent);
    const varietyScore = Math.max(
      0,
      Math.min(1, coverageScore * 0.5 + evenness * 0.3 + uniqueMealScore * 0.2),
    );

    dimensions.push({
      dimension: "Nutrition Variety",
      score: varietyScore,
      weight: scoringWeights.nutritionVariety,
      weighted: varietyScore * scoringWeights.nutritionVariety,
      explanation: `${mealTypeCount}/${MEAL_TYPES.length} meal types, ${macros.uniqueMeals} unique meals this week`,
    });

    // ── Protein check ─────────────────────────────────────────
    const avgDailyProtein = macros.totalLogs > 0 ? macros.protein / 7 : 0;
    if (avgDailyProtein > 0 && avgDailyProtein < alertThresholds.proteinMinimumGrams) {
      recommendations.push({
        type: "MEAL",
        title: "Increase protein intake",
        description: `Your average daily protein is ${Math.round(avgDailyProtein)}g. Aim for at least ${alertThresholds.proteinMinimumGrams}g daily.`,
        score: 0.8,
        data: { avgDailyProtein: Math.round(avgDailyProtein), minimum: alertThresholds.proteinMinimumGrams },
      });
    }

    // ── Overall score ─────────────────────────────────────────
    const overallScore = dimensions.reduce((sum, d) => sum + d.weighted, 0);

    return { overallScore: Math.round(overallScore * 100) / 100, dimensions, recommendations };
  }

  /**
   * Run the engine and persist recommendations.
   */
  static async generateAndPersist(
    userId: string,
    userCalorieTarget?: number | null,
  ): Promise<RecommendationEngineResult> {
    const result = await this.analyze(userId, userCalorieTarget);

    if (result.recommendations.length > 0) {
      await RecommendationsRepository.createMany(
        result.recommendations.map((r) => ({
          userId,
          type: r.type,
          title: r.title,
          description: r.description,
          score: r.score,
          data: r.data as any,
        })),
      );
    }

    return result;
  }
}
