import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { SEARCH } from "../../config/constants";

/**
 * Recommendations repository — sole owner of recommendation-related DB queries.
 *
 * All queries filter by deletedAt: null to respect soft-delete architecture.
 */
export class RecommendationsRepository {
  static findByUserId(userId: string, take = SEARCH.maxResults) {
    return prisma.recommendation.findMany({
      where: { userId, deletedAt: null },
      take: Math.min(take, SEARCH.maxResults),
      orderBy: { createdAt: "desc" },
    });
  }

  static findById(id: string, userId: string) {
    return prisma.recommendation.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  static update(id: string, data: Prisma.RecommendationUpdateInput) {
    return prisma.recommendation.update({ where: { id }, data });
  }

  static createMany(data: Prisma.RecommendationUncheckedCreateInput[]) {
    return prisma.recommendation.createMany({ data });
  }

  /**
   * Soft delete a recommendation.
   */
  static softDelete(id: string) {
    return prisma.recommendation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
