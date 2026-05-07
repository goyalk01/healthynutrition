import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

/**
 * Users repository — sole owner of user-related DB queries.
 *
 * Soft delete: users are marked with deletedAt instead of being destroyed.
 * This preserves historical nutrition data, analytics integrity, and
 * referential consistency with meals, habits, logs, and recommendations.
 */
export class UsersRepository {
  static findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { userPreferences: true },
    });
  }

  static update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  static upsertPreferences(
    userId: string,
    data: {
      dietaryRestrictions: string[];
      allergies: string[];
      cuisinePrefs: string[];
      dislikedFoods: string[];
    },
  ) {
    return prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  /**
   * Soft delete — preserves user data for analytics and referential integrity.
   * Also revokes all refresh tokens to prevent access after deletion.
   */
  static async delete(id: string) {
    return prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isRevoked: true },
      }),
      prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    ]);
  }

  /**
   * Restore a soft-deleted user account.
   */
  static restore(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
