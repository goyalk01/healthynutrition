import { prisma } from "../../config/database";
import { isPrototypeMode } from "../../config/runtime";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

const getPrototypeHabits = (userId: string) => {
  return [
    {
      id: `habit-water-${userId}`,
      userId,
      name: "Drink Water",
      description: "Stay hydrated throughout the day",
      category: "HYDRATION",
      frequency: "DAILY",
      targetCount: 8,
      unit: "glasses",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
};

export class HabitsService {
  static async list(userId: string) {
    if (isPrototypeMode || !prisma) {
      return getPrototypeHabits(userId);
    }

    return prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(userId: string, data: Record<string, unknown>) {
    if (isPrototypeMode || !prisma) {
      return {
        id: `habit-${Date.now()}`,
        userId,
        name: (data.name as string | undefined) ?? "Prototype Habit",
        description: (data.description as string | undefined) ?? null,
        category: (data.category as string | undefined) ?? "MINDFULNESS",
        frequency: (data.frequency as string | undefined) ?? "DAILY",
        targetCount: (data.targetCount as number | undefined) ?? 1,
        unit: (data.unit as string | undefined) ?? null,
        isActive: (data.isActive as boolean | undefined) ?? true,
        createdAt: new Date().toISOString(),
      };
    }

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
    if (isPrototypeMode || !prisma) {
      const existing = getPrototypeHabits(userId).find((habit) => habit.id === habitId);
      if (!existing) {
        throw toHttpError(404, "Habit not found");
      }

      return {
        ...existing,
        ...data,
        id: habitId,
      };
    }

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
    if (isPrototypeMode || !prisma) {
      const existing = getPrototypeHabits(userId).find((habit) => habit.id === habitId);
      if (!existing) {
        throw toHttpError(404, "Habit not found");
      }
      return;
    }

    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!habit) {
      throw toHttpError(404, "Habit not found");
    }

    await prisma.habit.delete({ where: { id: habitId } });
  }
}
