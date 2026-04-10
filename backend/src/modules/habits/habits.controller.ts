import { FastifyReply, FastifyRequest } from "fastify";
import { createSuccessResponse } from "../../utils/response";
import { HabitsService } from "./habits.service";

export class HabitsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const items = await HabitsService.list(request.user!.userId);
    return reply.send(createSuccessResponse(items));
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    const habit = await HabitsService.create(
      request.user!.userId,
      request.body as Record<string, unknown>,
    );

    return reply.code(201).send(createSuccessResponse(habit, "Habit created"));
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    const habit = await HabitsService.update(
      request.user!.userId,
      (request.params as { id: string }).id,
      request.body as Record<string, unknown>,
    );

    return reply.send(createSuccessResponse(habit, "Habit updated"));
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    await HabitsService.delete(request.user!.userId, (request.params as { id: string }).id);
    return reply.send(createSuccessResponse({ deleted: true }, "Habit deleted"));
  }
}
