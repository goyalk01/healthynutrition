import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { SEARCH } from "../../config/constants";

/**
 * Meals repository — sole owner of meal-related DB queries.
 */
export class MealsRepository {
  static findMany(
    where: Prisma.MealWhereInput,
    skip: number,
    take: number,
  ) {
    const safeTake = Math.min(take, 100);
    return prisma.$transaction([
      prisma.meal.findMany({
        where,
        skip,
        take: safeTake,
        orderBy: { createdAt: "desc" },
      }),
      prisma.meal.count({ where }),
    ]);
  }

  static findById(id: string, userId: string) {
    return prisma.meal.findFirst({ where: { id, userId } });
  }

  static create(data: Prisma.MealCreateInput) {
    return prisma.meal.create({ data });
  }

  static update(id: string, data: Prisma.MealUpdateInput) {
    return prisma.meal.update({ where: { id }, data });
  }

  static delete(id: string) {
    return prisma.meal.delete({ where: { id } });
  }

  static search(userId: string, query: string) {
    return prisma.meal.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      take: SEARCH.maxResults,
      orderBy: { createdAt: "desc" },
    });
  }

  /** Aggregate macros for a user within a date range. */
  static async aggregateMacros(
    userId: string,
    from?: Date,
    to?: Date,
  ) {
    const where: Prisma.MealLogWhereInput = { userId };
    if (from || to) {
      where.loggedAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const grouped = await prisma.mealLog.groupBy({
      by: ["mealId"],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        _all: true,
      },
    });

    if (grouped.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        totalLogs: 0,
        uniqueMeals: 0,
        mealTypeCounts: {} as Record<string, number>,
      };
    }

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        id: {
          in: grouped.map((row) => row.mealId),
        },
      },
      select: {
        id: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        mealType: true,
      },
    });

    const mealById = new Map(meals.map((meal) => [meal.id, meal]));
    const mealTypeCounts: Record<string, number> = {};

    const totals = grouped.reduce(
      (acc, row) => {
        const meal = mealById.get(row.mealId);
        if (!meal) {
          return acc;
        }

        const quantity = row._sum.quantity ?? 0;
        const count = row._count._all;
        mealTypeCounts[meal.mealType] = (mealTypeCounts[meal.mealType] ?? 0) + count;

        return {
          calories: acc.calories + meal.calories * quantity,
          protein: acc.protein + meal.protein * quantity,
          carbs: acc.carbs + meal.carbs * quantity,
          fat: acc.fat + meal.fat * quantity,
          totalLogs: acc.totalLogs + count,
          uniqueMeals: acc.uniqueMeals + 1,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, totalLogs: 0, uniqueMeals: 0 },
    );

    return {
      ...totals,
      mealTypeCounts,
    };
  }
}
