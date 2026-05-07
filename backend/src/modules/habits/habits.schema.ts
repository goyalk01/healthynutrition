import { z } from "zod";
import { HABIT_CATEGORIES, HABIT_FREQUENCIES } from "../../config/constants";

export const habitCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  category: z.enum(HABIT_CATEGORIES),
  frequency: z.enum(HABIT_FREQUENCIES),
  targetCount: z.number().int().positive().default(1),
  unit: z.string().max(30).optional(),
  isActive: z.boolean().optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial();

export type HabitCreateInput = z.infer<typeof habitCreateSchema>;
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>;
