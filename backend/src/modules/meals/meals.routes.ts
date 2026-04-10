import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { MealsController } from "./meals.controller";
import { mealCreateSchema, mealListQuerySchema, mealUpdateSchema } from "./meals.schema";

const idParamsSchema = z.object({ id: z.string().min(1) });
const searchQuerySchema = z.object({ q: z.string().min(1) });

const mealsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", async (request, reply) => {
    request.query = mealListQuerySchema.parse(request.query);
    return MealsController.list(request, reply);
  });

  fastify.post("/", async (request, reply) => {
    request.body = mealCreateSchema.parse(request.body);
    return MealsController.create(request, reply);
  });

  fastify.get("/search", async (request, reply) => {
    request.query = searchQuerySchema.parse(request.query);
    return MealsController.search(request, reply);
  });

  fastify.get("/:id", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    return MealsController.getById(request, reply);
  });

  fastify.patch("/:id", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    request.body = mealUpdateSchema.parse(request.body);
    return MealsController.update(request, reply);
  });

  fastify.delete("/:id", async (request, reply) => {
    request.params = idParamsSchema.parse(request.params);
    return MealsController.delete(request, reply);
  });
};

export default mealsRoutes;
