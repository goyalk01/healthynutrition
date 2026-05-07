import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../utils/response";
import { HabitsService } from "./habits.service";
import { HabitCreateInput, HabitUpdateInput } from "./habits.schema";

export class HabitsController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const items = await HabitsService.list(request.user!.userId);
    return sendSuccess(reply, request, items);
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    const habit = await HabitsService.create(
      request.user!.userId,
      request.body as HabitCreateInput,
    );

    return sendSuccess(reply, request, habit, "Habit created", 201);
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    const habit = await HabitsService.update(
      request.user!.userId,
      (request.params as { id: string }).id,
      request.body as HabitUpdateInput,
    );

    return sendSuccess(reply, request, habit, "Habit updated");
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    await HabitsService.delete(request.user!.userId, (request.params as { id: string }).id);
    return sendSuccess(reply, request, { deleted: true }, "Habit deleted");
  }
}
