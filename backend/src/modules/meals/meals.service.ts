import { API_ERRORS } from "../../config/constants";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../../utils/errors";
import { buildPaginationMeta } from "../../utils/pagination";
import { MealsRepository } from "./meals.repository";
import { MealCreateInput, MealListQuery, MealUpdateInput } from "./meals.schema";

/**
 * Meals service — pure business logic, delegates DB to MealsRepository.
 */
export class MealsService {
  static async list(userId: string, query: MealListQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.MealWhereInput = { userId };

    if (query.mealType) where.mealType = query.mealType;
    if (query.tag) where.tags = { has: query.tag };

    const [items, total] = await MealsRepository.findMany(where, skip, query.limit);

    return {
      items,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  static async getById(userId: string, mealId: string) {
    const meal = await MealsRepository.findById(mealId, userId);
    if (!meal) throw new NotFoundError("Meal", API_ERRORS.MEAL_NOT_FOUND);
    return meal;
  }

  static async create(userId: string, data: MealCreateInput) {
    return MealsRepository.create({
      user: { connect: { id: userId } },
      name: data.name,
      description: data.description ?? null,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? null,
      sugar: data.sugar ?? null,
      mealType: data.mealType,
      imageUrl: data.imageUrl ?? null,
      tags: data.tags ?? [],
      isCustom: data.isCustom ?? true,
    });
  }

  static async update(userId: string, mealId: string, data: MealUpdateInput) {
    await this.getById(userId, mealId);

    const updateData: Prisma.MealUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.calories !== undefined ? { calories: data.calories } : {}),
      ...(data.protein !== undefined ? { protein: data.protein } : {}),
      ...(data.carbs !== undefined ? { carbs: data.carbs } : {}),
      ...(data.fat !== undefined ? { fat: data.fat } : {}),
      ...(data.fiber !== undefined ? { fiber: data.fiber } : {}),
      ...(data.sugar !== undefined ? { sugar: data.sugar } : {}),
      ...(data.mealType !== undefined ? { mealType: data.mealType } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.isCustom !== undefined ? { isCustom: data.isCustom } : {}),
    };

    return MealsRepository.update(mealId, updateData);
  }

  static async delete(userId: string, mealId: string) {
    await this.getById(userId, mealId);
    await MealsRepository.delete(mealId);
  }

  static async search(userId: string, q: string) {
    const query = q.trim();
    if (!query) {
      return [];
    }

    const results = await MealsRepository.search(userId, query);
    return results;
  }
}
