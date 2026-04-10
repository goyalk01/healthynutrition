import { prisma } from "../../config/database";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

export class HabitsService {
  static async list(userId: string) {
    return prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(userId: string, data: Record<string, unknown>) {
    return prisma.habit.create({
      data: {
        userId,
        name: data.name as string,
        description: (data.description as string | undefined) ?? null,
        category: data.category as
          | "HYDRATION"
          | "SLEEP"
          | "EXERCISE"
          | "NUTRITION"
          | "MINDFULNESS",
        frequency: data.frequency as "DAILY" | "WEEKLY",
        targetCount: (data.targetCount as number | undefined) ?? 1,
        unit: (data.unit as string | undefined) ?? null,
        isActive: (data.isActive as boolean | undefined) ?? true,
      },
    });
  }

  static async update(userId: string, habitId: string, data: Record<string, unknown>) {
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!habit) {
      throw toHttpError(404, "Habit not found");
    }

    return prisma.habit.update({
      where: { id: habitId },
      data: {
        name: data.name as string | undefined,
        description: data.description as string | undefined,
        category: data.category as
          | "HYDRATION"
          | "SLEEP"
          | "EXERCISE"
          | "NUTRITION"
          | "MINDFULNESS"
          | undefined,
        frequency: data.frequency as "DAILY" | "WEEKLY" | undefined,
        targetCount: data.targetCount as number | undefined,
        unit: data.unit as string | undefined,
        isActive: data.isActive as boolean | undefined,
      },
    });
  }

  static async delete(userId: string, habitId: string) {
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!habit) {
      throw toHttpError(404, "Habit not found");
    }

    await prisma.habit.delete({ where: { id: habitId } });
  }
}
