import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { RecommendationsController } from "./recommendations.controller";
import { recommendationCreateSchema } from "./recommendations.schema";

const idParamsSchema = z.object({ id: z.string().min(1) });

const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", RecommendationsController.list);

  fastify.post("/generate", async (request, reply) => {
    request.body = recommendationCreateSchema.parse(request.body);
    return RecommendationsController.generate(request, reply);
  });

  fastify.patch("/:id/read", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    return RecommendationsController.markRead(request, reply);
  });

  fastify.patch("/:id/save", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    return RecommendationsController.toggleSave(request, reply);
  });
};

export default recommendationsRoutes;
