import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

/**
 * Habits repository — sole owner of habit-related DB queries.
 */
export class HabitsRepository {
  static findByUserId(userId: string) {
    return prisma.habit.findMany({
      where: { userId, deletedAt: null },

      orderBy: { createdAt: "desc" },
    });
  }

  static findById(id: string, userId: string) {
    return prisma.habit.findFirst({ where: { id, userId, deletedAt: null } });

  }

  static create(data: Prisma.HabitCreateInput) {
    return prisma.habit.create({ data });
  }

  static update(id: string, data: Prisma.HabitUpdateInput) {
    return prisma.habit.update({ where: { id }, data });
  }

  static delete(id: string) {
    return prisma.habit.update({ where: { id }, data: { deletedAt: new Date() } });

  }

  static countActiveHabits(userId: string) {
    return prisma.habit.count({ where: { userId, isActive: true, deletedAt: null } });

  }

  /** Get habit completion rates for scoring. */
  static async getCompletionRates(userId: string, since: Date) {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true, deletedAt: null },

      include: {
        logs: {
          where: { loggedAt: { gte: since }, deletedAt: null },

          select: { count: true, loggedAt: true },
        },
      },
    });

    return habits.map((habit) => {
      const totalLogged = habit.logs.reduce((sum, l) => sum + l.count, 0);
      const daysSince = Math.max(
        1,
        Math.ceil((Date.now() - since.getTime()) / 86_400_000),
      );
      const expectedCount =
        habit.frequency === "DAILY"
          ? habit.targetCount * daysSince
          : habit.targetCount * Math.ceil(daysSince / 7);

      return {
        habitId: habit.id,
        name: habit.name,
        category: habit.category,
        completionRate: Math.min(1, totalLogged / Math.max(1, expectedCount)),
      };
    });
  }
}
