import { HabitCategory, HabitFrequency } from "@prisma/client";
import { z } from "zod";

export const habitCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.nativeEnum(HabitCategory),
  frequency: z.nativeEnum(HabitFrequency),
  targetCount: z.number().int().positive().default(1),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial();
