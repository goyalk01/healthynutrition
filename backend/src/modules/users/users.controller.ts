import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";
import { createSuccessResponse } from "../../utils/response";

export class UsersController {
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const profile = await UsersService.getProfile(request.user!.userId);
    return reply.send(createSuccessResponse(profile));
  }

  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const profile = await UsersService.updateProfile(
      request.user!.userId,
      request.body as Record<string, unknown>,
    );

    return reply.send(createSuccessResponse(profile, "Profile updated"));
  }

  static async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    const preferences = await UsersService.upsertPreferences(
      request.user!.userId,
      request.body as {
        dietaryRestrictions: string[];
        allergies: string[];
        cuisinePrefs: string[];
        dislikedFoods: string[];
      },
    );

    return reply.send(createSuccessResponse(preferences, "Preferences updated"));
  }

  static async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    await UsersService.deleteAccount(request.user!.userId);
    return reply.send(createSuccessResponse({ deleted: true }, "Account deleted"));
  }
}
