import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { RecommendationsController } from "./recommendations.controller";
import { recommendationGenerateSchema } from "./recommendations.schema";

const idParamsSchema = z.object({ id: z.string().min(1) });

const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Recommendations"],
        summary: "List user recommendations",
        security: [{ bearerAuth: [] }],
      },
    },
    RecommendationsController.list,
  );

  fastify.post(
    "/generate",
    {
      schema: {
        tags: ["Recommendations"],
        summary: "Generate deterministic AI recommendations",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.body = recommendationGenerateSchema.parse(request.body ?? {});
      return RecommendationsController.generate(request, reply);
    },
  );

  fastify.patch(
    "/:id/read",
    {
      schema: {
        tags: ["Recommendations"],
        summary: "Mark recommendation as read",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.params = idParamsSchema.parse(request.params);
      return RecommendationsController.markRead(request, reply);
    },
  );

  fastify.patch(
    "/:id/save",
    {
      schema: {
        tags: ["Recommendations"],
        summary: "Toggle recommendation saved status",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.params = idParamsSchema.parse(request.params);
      return RecommendationsController.toggleSave(request, reply);
    },
  );
};

export default recommendationsRoutes;
