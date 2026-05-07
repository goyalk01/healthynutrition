import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";
import { sendSuccess } from "../../utils/response";
import { PreferencesInput, ProfileUpdateInput } from "./users.schema";

export class UsersController {
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const profile = await UsersService.getProfile(request.user!.userId);
    return sendSuccess(reply, request, profile);
  }

  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const profile = await UsersService.updateProfile(
      request.user!.userId,
      request.body as ProfileUpdateInput,
    );

    return sendSuccess(reply, request, profile, "Profile updated");
  }

  static async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    const preferences = await UsersService.upsertPreferences(
      request.user!.userId,
      request.body as PreferencesInput,
    );

    return sendSuccess(reply, request, preferences, "Preferences updated");
  }

  static async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    await UsersService.deleteAccount(request.user!.userId);
    return sendSuccess(reply, request, { deleted: true }, "Account deleted");
  }
}
