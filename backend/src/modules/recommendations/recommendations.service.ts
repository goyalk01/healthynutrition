import { NotFoundError } from "../../utils/errors";
import { API_ERRORS } from "../../config/constants";
import { parseJsonRecord } from "../../utils/json";
import { UsersRepository } from "../users/users.repository";
import { RecommendationEngine } from "./recommendations.engine";
import { RecommendationsRepository } from "./recommendations.repository";
import { RecommendationGenerateInput } from "./recommendations.schema";

/**
 * Recommendations service — delegates DB to repository,
 * delegates scoring to the recommendation engine.
 */
export class RecommendationsService {
  static async list(userId: string) {
    const items = await RecommendationsRepository.findByUserId(userId);
    return items.map((item) => ({
      ...item,
      data: parseJsonRecord(item.data, "recommendation.data"),
    }));
  }

  static async generate(userId: string, input: RecommendationGenerateInput) {
    const user = await UsersRepository.findById(userId);
    const result = input.persist
      ? await RecommendationEngine.generateAndPersist(
          userId,
          user?.dailyCalorieTarget,
        )
      : await RecommendationEngine.analyze(userId, user?.dailyCalorieTarget);

    return {
      ...result,
      recommendations: result.recommendations.map((item) => ({
        ...item,
        data: parseJsonRecord(item.data, "recommendation.engine"),
      })),
      persisted: input.persist,
    };
  }

  static async markRead(userId: string, id: string) {
    const rec = await RecommendationsRepository.findById(id, userId);
    if (!rec) throw new NotFoundError("Recommendation", API_ERRORS.RECOMMENDATION_NOT_FOUND);
    const updated = await RecommendationsRepository.update(id, { isRead: true });
    return {
      ...updated,
      data: parseJsonRecord(updated.data, "recommendation.data"),
    };
  }

  static async toggleSave(userId: string, id: string) {
    const rec = await RecommendationsRepository.findById(id, userId);
    if (!rec) throw new NotFoundError("Recommendation", API_ERRORS.RECOMMENDATION_NOT_FOUND);
    const updated = await RecommendationsRepository.update(id, { isSaved: !rec.isSaved });
    return {
      ...updated,
      data: parseJsonRecord(updated.data, "recommendation.data"),
    };
  }
}
