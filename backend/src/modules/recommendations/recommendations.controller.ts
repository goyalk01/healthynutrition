import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../utils/response";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationGenerateInput } from "./recommendations.schema";

export class RecommendationsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const items = await RecommendationsService.list(request.user!.userId);
    return sendSuccess(reply, request, items);
  }

  static async generate(request: FastifyRequest, reply: FastifyReply) {
    const recommendation = await RecommendationsService.generate(
      request.user!.userId,
      request.body as RecommendationGenerateInput,
    );

    return sendSuccess(
      reply,
      request,
      recommendation,
      "Recommendation generated",
      201,
    );
  }

  static async markRead(request: FastifyRequest, reply: FastifyReply) {
    const item = await RecommendationsService.markRead(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return sendSuccess(reply, request, item, "Recommendation marked as read");
  }

  static async toggleSave(request: FastifyRequest, reply: FastifyReply) {
    const item = await RecommendationsService.toggleSave(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return sendSuccess(reply, request, item, "Recommendation updated");
  }
}
