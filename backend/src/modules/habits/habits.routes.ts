import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { HabitsController } from "./habits.controller";
import { habitCreateSchema, habitUpdateSchema } from "./habits.schema";

const idParamsSchema = z.object({ id: z.string().min(1) });

const habitsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", HabitsController.list);

  fastify.post("/", async (request, reply) => {
    request.body = habitCreateSchema.parse(request.body);
    return HabitsController.create(request, reply);
  });

  fastify.patch("/:id", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    request.body = habitUpdateSchema.parse(request.body);
    return HabitsController.update(request, reply);
  });

  fastify.delete("/:id", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    return HabitsController.delete(request, reply);
  });
};

export default habitsRoutes;
