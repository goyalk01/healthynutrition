import { FastifyReply, FastifyRequest } from "fastify";
import { createSuccessResponse } from "../../utils/response";
import { MealsService } from "./meals.service";

export class MealsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const result = await MealsService.list(
      request.user!.userId,
      request.query as { page: number; limit: number; mealType?: string; tag?: string },
    );

    return reply.send(createSuccessResponse(result));
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.create(
      request.user!.userId,
      request.body as Record<string, unknown>,
    );

    return reply.code(201).send(createSuccessResponse(meal, "Meal created"));
  }

  static async getById(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.getById(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return reply.send(createSuccessResponse(meal));
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.update(
      request.user!.userId,
      (request.params as { id: string }).id,
      request.body as Record<string, unknown>,
    );

    return reply.send(createSuccessResponse(meal, "Meal updated"));
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    await MealsService.delete(request.user!.userId, (request.params as { id: string }).id);
    return reply.send(createSuccessResponse({ deleted: true }, "Meal deleted"));
  }

  static async search(request: FastifyRequest, reply: FastifyReply) {
    const items = await MealsService.search(
      request.user!.userId,
      (request.query as { q: string }).q || "",
    );

    return reply.send(createSuccessResponse(items));
  }
}
