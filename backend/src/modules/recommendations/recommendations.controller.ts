import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../utils/response";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationGenerateInput } from "./recommendations.schema";

/**
 * Recommendations controller — thin HTTP boundary layer.
 *
 * The generate endpoint supports two modes:
 * - async (default): dispatches to queue, returns 202 Accepted immediately
 * - sync: runs engine inline, returns 201 with full result (dev/testing)
 */
export class RecommendationsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const items = await RecommendationsService.list(request.user!.userId);
    return sendSuccess(reply, request, items);
  }

  static async generate(request: FastifyRequest, reply: FastifyReply) {
    const input = request.body as RecommendationGenerateInput;
    const result = await RecommendationsService.generate(
      request.user!.userId,
      input,
    );

    // If queued asynchronously, return 202 Accepted
    if (result.queued) {
      return sendSuccess(
        reply,
        request,
        { queued: true, message: "Recommendation generation queued" },
        "Recommendation generation queued",
        202,
      );
    }

    // Synchronous generation — return full result
    return sendSuccess(
      reply,
      request,
      result,
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
