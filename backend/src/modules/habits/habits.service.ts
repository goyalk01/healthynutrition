import { API_ERRORS } from "../../config/constants";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../../utils/errors";
import { HabitsRepository } from "./habits.repository";
import { HabitCreateInput, HabitUpdateInput } from "./habits.schema";

/**
 * Habits service — pure business logic, delegates DB to HabitsRepository.
 */
export class HabitsService {
  static async list(userId: string) {
    return HabitsRepository.findByUserId(userId);
  }

  static async create(userId: string, data: HabitCreateInput) {
    return HabitsRepository.create({
      user: { connect: { id: userId } },
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      frequency: data.frequency,
      targetCount: data.targetCount ?? 1,
      unit: data.unit ?? null,
      isActive: data.isActive ?? true,
    });
  }

  static async update(userId: string, habitId: string, data: HabitUpdateInput) {
    const habit = await HabitsRepository.findById(habitId, userId);
    if (!habit) throw new NotFoundError("Habit", API_ERRORS.HABIT_NOT_FOUND);

    const updateData: Prisma.HabitUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.frequency !== undefined ? { frequency: data.frequency } : {}),
      ...(data.targetCount !== undefined ? { targetCount: data.targetCount } : {}),
      ...(data.unit !== undefined ? { unit: data.unit } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };

    return HabitsRepository.update(habitId, updateData);
  }

  static async delete(userId: string, habitId: string) {
    const habit = await HabitsRepository.findById(habitId, userId);
    if (!habit) throw new NotFoundError("Habit", API_ERRORS.HABIT_NOT_FOUND);
    await HabitsRepository.delete(habitId);
  }
}
