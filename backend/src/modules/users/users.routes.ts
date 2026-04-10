import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { UsersController } from "./users.controller";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  height: z.number().positive().nullable().optional(),
  activityLevel: z
    .enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"])
    .optional(),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN", "IMPROVE_ENERGY"]).optional(),
  dailyCalorieTarget: z.number().int().positive().nullable().optional(),
});

const preferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  cuisinePrefs: z.array(z.string()).default([]),
  dislikedFoods: z.array(z.string()).default([]),
});

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/profile", UsersController.getProfile);

  fastify.patch("/profile", async (request, reply) => {
    request.body = profileSchema.parse(request.body);
    return UsersController.updateProfile(request, reply);
  });

  fastify.put("/preferences", async (request, reply) => {
    request.body = preferencesSchema.parse(request.body);
    return UsersController.updatePreferences(request, reply);
  });

  fastify.delete("/account", UsersController.deleteAccount);
};

export default usersRoutes;
