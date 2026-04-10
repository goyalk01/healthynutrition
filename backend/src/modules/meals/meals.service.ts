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
    const where: Record<string, unknown> = { userId };

    if (query.mealType) {
      where.mealType = query.mealType;
    }
    if (query.tag) {
      // SQLite: tags are stored as JSON text, use contains for filtering
      where.tags = { contains: query.tag };
    }

    const [items, total] = await prisma.$transaction([
      prisma.meal.findMany({ where, skip, take: query.limit, orderBy: { createdAt: "desc" } }),
      prisma.meal.count({ where }),
    ]);

    return {
      items: items.map((item: any) => ({
        ...item,
        tags: typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags,
      })),
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
        mealType: data.mealType as string,
        imageUrl: (data.imageUrl as string | undefined) ?? null,
        tags: JSON.stringify((data.tags as string[]) ?? []),
        isCustom: (data.isCustom as boolean | undefined) ?? true,
      },
    });
  }

  static async getById(userId: string, mealId: string) {
    const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) {
      throw toHttpError(404, "Meal not found");
    }

    return {
      ...meal,
      tags: typeof meal.tags === "string" ? JSON.parse(meal.tags) : meal.tags,
    };
  }

  static async update(userId: string, mealId: string, data: Record<string, unknown>) {
    await this.getById(userId, mealId);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.calories !== undefined) updateData.calories = data.calories;
    if (data.protein !== undefined) updateData.protein = data.protein;
    if (data.carbs !== undefined) updateData.carbs = data.carbs;
    if (data.fat !== undefined) updateData.fat = data.fat;
    if (data.fiber !== undefined) updateData.fiber = data.fiber;
    if (data.sugar !== undefined) updateData.sugar = data.sugar;
    if (data.mealType !== undefined) updateData.mealType = data.mealType;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.isCustom !== undefined) updateData.isCustom = data.isCustom;

    return prisma.meal.update({
      where: { id: mealId },
      data: updateData,
    });
  }

  static async delete(userId: string, mealId: string) {
    await this.getById(userId, mealId);
    await prisma.meal.delete({ where: { id: mealId } });
  }

  static async search(userId: string, q: string) {
    // SQLite: use contains for case-insensitive search (SQLite is case-insensitive by default for ASCII)
    const results = await prisma.meal.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      take: 25,
      orderBy: { createdAt: "desc" },
    });

    return results.map((item: any) => ({
      ...item,
      tags: typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags,
    }));
  }
}
