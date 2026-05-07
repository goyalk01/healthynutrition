import { Prisma } from "@prisma/client";
import { SEARCH } from "../../config/constants";

let mockMeals: any[] = [];

export class MockMealsRepository {
  static async findMany(where: Prisma.MealWhereInput, skip: number, take: number): Promise<[any[], number]> {
    const data = mockMeals.slice(skip, skip + take);
    return [data, mockMeals.length];
  }

  static async findById(id: string, userId: string) {
    return mockMeals.find((m) => m.id === id && m.userId === userId) || null;
  }

  static async create(data: Prisma.MealCreateInput) {
    const meal = { ...data, id: "mock-meal-" + Date.now(), createdAt: new Date() };
    mockMeals.push(meal);
    return meal;
  }

  static async update(id: string, data: Prisma.MealUpdateInput) {
    const index = mockMeals.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Not found");
    mockMeals[index] = { ...mockMeals[index], ...data };
    return mockMeals[index];
  }

  static async delete(id: string) {
    const index = mockMeals.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Not found");
    const [deleted] = mockMeals.splice(index, 1);
    return deleted;
  }

  static async search(userId: string, query: string) {
    const q = query.toLowerCase();
    return mockMeals
      .filter((m) => m.userId === userId && (m.name.toLowerCase().includes(q) || m.tags.some((t: string) => t.toLowerCase().includes(q))))
      .slice(0, SEARCH.maxResults);
  }

  static async aggregateMacros(userId: string, from?: Date, to?: Date) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      totalLogs: 0,
      uniqueMeals: 0,
      mealTypeCounts: {},
    };
  }
}
