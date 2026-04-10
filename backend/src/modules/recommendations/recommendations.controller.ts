import { FastifyReply, FastifyRequest } from "fastify";
import { createSuccessResponse } from "../../utils/response";
import { RecommendationsService } from "./recommendations.service";

export class RecommendationsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const items = await RecommendationsService.list(request.user!.userId);
    return reply.send(createSuccessResponse(items));
  }

  static async generate(request: FastifyRequest, reply: FastifyReply) {
    const recommendation = await RecommendationsService.generate(
      request.user!.userId,
      request.body as Record<string, unknown>,
    );

    return reply.code(201).send(createSuccessResponse(recommendation, "Recommendation generated"));
  }

  static async markRead(request: FastifyRequest, reply: FastifyReply) {
    const item = await RecommendationsService.markRead(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return reply.send(createSuccessResponse(item, "Recommendation marked as read"));
  }

  static async toggleSave(request: FastifyRequest, reply: FastifyReply) {
    const item = await RecommendationsService.toggleSave(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return reply.send(createSuccessResponse(item, "Recommendation updated"));
  }
}
