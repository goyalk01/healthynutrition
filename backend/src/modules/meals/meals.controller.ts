import { FastifyReply, FastifyRequest } from "fastify";
import { sendPaginated, sendSuccess } from "../../utils/response";
import { MealsService } from "./meals.service";
import { MealCreateInput, MealListQuery, MealUpdateInput } from "./meals.schema";

export class MealsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const result = await MealsService.list(
      request.user!.userId,
      request.query as MealListQuery,
    );

    return sendPaginated(reply, request, result.items, result.pagination);
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.create(
      request.user!.userId,
      request.body as MealCreateInput,
    );

    return sendSuccess(reply, request, meal, "Meal created", 201);
  }

  static async getById(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.getById(
      request.user!.userId,
      (request.params as { id: string }).id,
    );

    return sendSuccess(reply, request, meal);
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    const meal = await MealsService.update(
      request.user!.userId,
      (request.params as { id: string }).id,
      request.body as MealUpdateInput,
    );

    return sendSuccess(reply, request, meal, "Meal updated");
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    await MealsService.delete(request.user!.userId, (request.params as { id: string }).id);
    return sendSuccess(reply, request, { deleted: true }, "Meal deleted");
  }

  static async search(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { q: string };
    const items = await MealsService.search(
      request.user!.userId,
      query.q || "",
    );

    return sendSuccess(reply, request, items);
  }
}
