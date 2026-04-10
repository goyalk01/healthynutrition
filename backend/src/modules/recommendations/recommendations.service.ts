import { prisma } from "../../config/database";
import { env } from "../../config/env";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

const isPrototypeMode = env.NODE_ENV !== "production";

const getPrototypeRecommendations = (userId: string) => {
  return [
    {
      id: `rec-${userId}`,
      userId,
      type: "INSIGHT",
      title: "Great consistency",
      description: "You logged meals consistently this week. Keep your streak going.",
      data: { source: "prototype" },
      score: 0.92,
      isRead: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    },
  ];
};

export class RecommendationsService {
  static async list(userId: string) {
    if (isPrototypeMode) {
      return getPrototypeRecommendations(userId);
    }

    return prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async generate(userId: string, data: Record<string, unknown>) {
    if (isPrototypeMode) {
      return {
        id: `rec-${Date.now()}`,
        userId,
        type: (data.type as string | undefined) ?? "INSIGHT",
        title: (data.title as string | undefined) ?? "Prototype recommendation",
        description: (data.description as string | undefined) ?? "This is a prototype recommendation.",
        data: (data.data as object | undefined) ?? { source: "prototype" },
        score: (data.score as number | undefined) ?? 0.8,
        isRead: false,
        isSaved: false,
        createdAt: new Date().toISOString(),
      };
    }

    return prisma.recommendation.create({
      data: {
        userId,
        type: data.type as "MEAL" | "HABIT" | "INSIGHT" | "ALERT",
        title: data.title as string,
        description: data.description as string,
        data: data.data as object,
        score: data.score as number,
      },
    });
  }

  static async markRead(userId: string, id: string) {
    if (isPrototypeMode) {
      const item = getPrototypeRecommendations(userId).find((rec) => rec.id === id);
      if (!item) {
        throw toHttpError(404, "Recommendation not found");
      }

      return {
        ...item,
        isRead: true,
      };
    }

    const recommendation = await prisma.recommendation.findFirst({ where: { id, userId } });
    if (!recommendation) {
      throw toHttpError(404, "Recommendation not found");
    }

    return prisma.recommendation.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async toggleSave(userId: string, id: string) {
    if (isPrototypeMode) {
      const item = getPrototypeRecommendations(userId).find((rec) => rec.id === id);
      if (!item) {
        throw toHttpError(404, "Recommendation not found");
      }

      return {
        ...item,
        isSaved: !item.isSaved,
      };
    }

    const recommendation = await prisma.recommendation.findFirst({ where: { id, userId } });
    if (!recommendation) {
      throw toHttpError(404, "Recommendation not found");
    }

    return prisma.recommendation.update({
      where: { id },
      data: { isSaved: !recommendation.isSaved },
    });
  }
}
