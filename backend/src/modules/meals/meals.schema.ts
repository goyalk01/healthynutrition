import { z } from "zod";
import { MEAL_TYPES, PAGINATION } from "../../config/constants";

export const mealCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
  sugar: z.number().nonnegative().optional(),
  mealType: z.enum(MEAL_TYPES),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  isCustom: z.boolean().optional(),
});

export const mealUpdateSchema = mealCreateSchema.partial();

export const mealListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxLimit)
    .default(PAGINATION.defaultLimit),
  mealType: z.enum(MEAL_TYPES).optional(),
  tag: z.string().optional(),
});

export type MealCreateInput = z.infer<typeof mealCreateSchema>;
export type MealUpdateInput = z.infer<typeof mealUpdateSchema>;
export type MealListQuery = z.infer<typeof mealListQuerySchema>;
