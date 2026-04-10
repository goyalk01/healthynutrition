import { prisma } from "../../config/database";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

export class RecommendationsService {
  static async list(userId: string) {
    return prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async generate(userId: string, data: Record<string, unknown>) {
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
