import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { SEARCH } from "../../config/constants";

/**
 * Recommendations repository.
 */
export class RecommendationsRepository {
  static findByUserId(userId: string, take = SEARCH.maxResults) {
    return prisma.recommendation.findMany({
      where: { userId },
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  static findById(id: string, userId: string) {
    return prisma.recommendation.findFirst({ where: { id, userId } });
  }

  static update(id: string, data: Prisma.RecommendationUpdateInput) {
    return prisma.recommendation.update({ where: { id }, data });
  }

  static createMany(data: Prisma.RecommendationUncheckedCreateInput[]) {
    return prisma.recommendation.createMany({ data });
  }
}
