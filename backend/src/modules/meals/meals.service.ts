import crypto from "crypto";
import { prisma } from "../../config/database";
import { isPrototypeMode } from "../../config/runtime";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

const getPrototypeMeals = (userId: string) => {
  const now = new Date().toISOString();
  return [
    {
      id: `meal-prototype-${userId}`,
      userId,
      name: "Prototype Power Bowl",
      description: "Demo meal for UI flow",
      calories: 520,
      protein: 32,
      carbs: 48,
      fat: 18,
      fiber: 10,
      sugar: 6,
      mealType: "LUNCH",
      imageUrl: null,
      tags: ["high-protein", "prototype"],
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export class MealsService {
  static async list(
    userId: string,
    query: { page: number; limit: number; mealType?: string; tag?: string },
  ) {
    if (isPrototypeMode || !prisma) {
      const items = getPrototypeMeals(userId);
      return {
        items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: items.length,
          totalPages: 1,
        },
      };
    }

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
    if (isPrototypeMode) {
      return {
        id: crypto.randomUUID(),
        userId,
        name: data.name as string,
        description: (data.description as string | undefined) ?? null,
        calories: (data.calories as number | undefined) ?? 0,
        protein: (data.protein as number | undefined) ?? 0,
        carbs: (data.carbs as number | undefined) ?? 0,
        fat: (data.fat as number | undefined) ?? 0,
        fiber: (data.fiber as number | undefined) ?? null,
        sugar: (data.sugar as number | undefined) ?? null,
        mealType: (data.mealType as string | undefined) ?? "SNACK",
        imageUrl: (data.imageUrl as string | undefined) ?? null,
        tags: (data.tags as string[] | undefined) ?? [],
        isCustom: (data.isCustom as boolean | undefined) ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return prisma?.meal.create({
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
    if (isPrototypeMode) {
      const meal = getPrototypeMeals(userId).find((item) => item.id === mealId) ?? getPrototypeMeals(userId)[0];
      if (!meal) {
        throw toHttpError(404, "Meal not found");
      }
      return meal;
    }

    const meal = await prisma?.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) {
      throw toHttpError(404, "Meal not found");
    }

    return meal;
  }

  static async update(userId: string, mealId: string, data: Record<string, unknown>) {
    if (isPrototypeMode) {
      const existing = await this.getById(userId, mealId);
      return {
        ...existing,
        ...data,
        id: mealId,
        userId,
        updatedAt: new Date().toISOString(),
      };
    }

    await this.getById(userId, mealId);
    return prisma?.meal.update({
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
    if (isPrototypeMode) {
      await this.getById(userId, mealId);
      return;
    }

    await this.getById(userId, mealId);
    await prisma?.meal.delete({ where: { id: mealId } });
  }

  static async search(userId: string, q: string) {
    if (isPrototypeMode) {
      const items = getPrototypeMeals(userId);
      const query = q.trim().toLowerCase();
      if (!query) {
        return items;
      }

      return items.filter(
        (item) => item.name.toLowerCase().includes(query) || item.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return prisma?.meal.findMany({
      where: {
        userId,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { tags: { has: q } }],
      },
      take: 25,
      orderBy: { createdAt: "desc" },
    }) ?? [];
  }
}
