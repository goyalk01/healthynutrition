import { z } from "zod";
import { ACTIVITY_LEVELS, GOALS } from "../../config/constants";

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  height: z.number().positive().nullable().optional(),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional(),
  goal: z.enum(GOALS).optional(),
  dailyCalorieTarget: z.number().int().positive().nullable().optional(),
});

export const preferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  cuisinePrefs: z.array(z.string()).default([]),
  dislikedFoods: z.array(z.string()).default([]),
});

export type ProfileUpdateInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
