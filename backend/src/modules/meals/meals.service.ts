import { prisma } from "../../config/database";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

export class MealsService {
  static async list(
    userId: string,
    query: { page: number; limit: number; mealType?: string; tag?: string },
  ) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      userId,
      ...(query.mealType
        ? {
            mealType: query.mealType as
              | "BREAKFAST"
              | "LUNCH"
              | "DINNER"
              | "SNACK"
              | "PRE_WORKOUT"
              | "POST_WORKOUT",
          }
        : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.meal.findMany({ where, skip, take: query.limit, orderBy: { createdAt: "desc" } }),
      prisma.meal.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  static async create(userId: string, data: Record<string, unknown>) {
    return prisma.meal.create({
      data: {
        userId,
        name: data.name as string,
        description: (data.description as string | undefined) ?? null,
        calories: data.calories as number,
        protein: data.protein as number,
        carbs: data.carbs as number,
        fat: data.fat as number,
        fiber: (data.fiber as number | undefined) ?? null,
        sugar: (data.sugar as number | undefined) ?? null,
        mealType: data.mealType as
          | "BREAKFAST"
          | "LUNCH"
          | "DINNER"
          | "SNACK"
          | "PRE_WORKOUT"
          | "POST_WORKOUT",
        imageUrl: (data.imageUrl as string | undefined) ?? null,
        tags: (data.tags as string[] | undefined) ?? [],
        isCustom: (data.isCustom as boolean | undefined) ?? true,
      },
    });
  }

  static async getById(userId: string, mealId: string) {
    const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) {
      throw toHttpError(404, "Meal not found");
    }

    return meal;
  }

  static async update(userId: string, mealId: string, data: Record<string, unknown>) {
    await this.getById(userId, mealId);
    return prisma.meal.update({
      where: { id: mealId },
      data: {
        name: data.name as string | undefined,
        description: data.description as string | undefined,
        calories: data.calories as number | undefined,
        protein: data.protein as number | undefined,
        carbs: data.carbs as number | undefined,
        fat: data.fat as number | undefined,
        fiber: data.fiber as number | undefined,
        sugar: data.sugar as number | undefined,
        mealType: data.mealType as
          | "BREAKFAST"
          | "LUNCH"
          | "DINNER"
          | "SNACK"
          | "PRE_WORKOUT"
          | "POST_WORKOUT"
          | undefined,
        imageUrl: data.imageUrl as string | undefined,
        tags: data.tags as string[] | undefined,
        isCustom: data.isCustom as boolean | undefined,
      },
    });
  }

  static async delete(userId: string, mealId: string) {
    await this.getById(userId, mealId);
    await prisma.meal.delete({ where: { id: mealId } });
  }

  static async search(userId: string, q: string) {
    return prisma.meal.findMany({
      where: {
        userId,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { tags: { has: q } }],
      },
      take: 25,
      orderBy: { createdAt: "desc" },
    });
  }
}
