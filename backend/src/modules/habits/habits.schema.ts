import { z } from "zod";

export const habitCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(["HYDRATION", "SLEEP", "EXERCISE", "NUTRITION", "MINDFULNESS"]),
  frequency: z.enum(["DAILY", "WEEKLY"]),
  targetCount: z.number().int().positive().default(1),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial();
