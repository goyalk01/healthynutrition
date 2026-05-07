import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

/**
 * Users repository.
 */
export class UsersRepository {
  static findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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

  static delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
