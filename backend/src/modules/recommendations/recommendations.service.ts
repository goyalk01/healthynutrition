import { NotFoundError } from "../../utils/errors";
import { API_ERRORS } from "../../config/constants";
import { UsersRepository } from "../users/users.repository";
import { RecommendationEngine, RecommendationEngineResult } from "./recommendations.engine";
import { RecommendationsRepository } from "./recommendations.repository";
import { RecommendationGenerateInput } from "./recommendations.schema";
import { enqueueRecommendation } from "./recommendations.queue";

/**
 * Recommendations service — delegates DB to repository,
 * delegates scoring to the recommendation engine.
 *
 * Generation modes:
 * 1. Queue-backed (production): dispatches job, returns immediately
 * 2. Synchronous (dev/testing): runs engine inline for instant feedback
 *
 * The queue path is preferred because recommendation generation involves
 * heavy DB aggregation that blocks the event loop under scale.
 */

type GenerateResult = (RecommendationEngineResult & { persisted: boolean; queued?: false }) | { queued: true };

export class RecommendationsService {
  static async list(userId: string) {
    const items = await RecommendationsRepository.findByUserId(userId);
    return items;
  }

  static async generate(userId: string, input: RecommendationGenerateInput): Promise<GenerateResult> {
    const user = await UsersRepository.findById(userId);

    // Prefer async queue-backed generation when the queue is available.
    // This prevents blocking the HTTP request with heavy DB aggregation.
    if (input.persist) {
      const queued = await this.tryEnqueue(userId, user?.dailyCalorieTarget);
      if (queued) {
        return { queued: true };
      }
    }

    // Fallback: synchronous generation (dev mode or non-persist requests)
    const result = input.persist
      ? await RecommendationEngine.generateAndPersist(
          userId,
          user?.dailyCalorieTarget,
        )
      : await RecommendationEngine.analyze(userId, user?.dailyCalorieTarget);

    return {
      ...result,
      persisted: input.persist,
    };
  }

  static async markRead(userId: string, id: string) {
    const rec = await RecommendationsRepository.findById(id, userId);
    if (!rec) throw new NotFoundError("Recommendation", API_ERRORS.RECOMMENDATION_NOT_FOUND);
    const updated = await RecommendationsRepository.update(id, { isRead: true });
    return updated;
  }

  static async toggleSave(userId: string, id: string) {
    const rec = await RecommendationsRepository.findById(id, userId);
    if (!rec) throw new NotFoundError("Recommendation", API_ERRORS.RECOMMENDATION_NOT_FOUND);
    const updated = await RecommendationsRepository.update(id, { isSaved: !rec.isSaved });
    return updated;
  }

  /**
   * Attempt to enqueue recommendation generation.
   * Returns true if successfully queued, false if queue unavailable (dev mode).
   */
  private static async tryEnqueue(
    userId: string,
    userCalorieTarget?: number | null,
  ): Promise<boolean> {
    try {
      await enqueueRecommendation({
        userId,
        userCalorieTarget,
        persist: true,
        triggeredAt: new Date().toISOString(),
      });
      // enqueueRecommendation is a no-op when queue is null (dev mode)
      // We check if the queue exists to determine if it was truly queued
      const { recommendationsQueue } = await import("./recommendations.queue");
      return recommendationsQueue !== null;
    } catch {
      // Queue dispatch failed — fall back to synchronous
      return false;
    }
  }
}
