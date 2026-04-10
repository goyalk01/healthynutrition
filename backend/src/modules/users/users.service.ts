import { prisma } from "../../config/database";
import { isPrototypeMode } from "../../config/runtime";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

export class UsersService {
  static async getProfile(userId: string) {
    if (isPrototypeMode || !prisma) {
      return {
        id: userId,
        email: `${userId}@prototype.local`,
        name: "Prototype User",
        avatarUrl: null,
        age: null,
        weight: null,
        height: null,
        activityLevel: "MODERATE",
        goal: "MAINTAIN",
        dailyCalorieTarget: 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userPreferences: {
          dietaryRestrictions: [],
          allergies: [],
          cuisinePrefs: [],
          dislikedFoods: [],
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPreferences: true },
    });

    if (!user) {
      throw toHttpError(404, "User not found");
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatarUrl?: string | null;
      age?: number | null;
      weight?: number | null;
      height?: number | null;
      activityLevel?:
        | "SEDENTARY"
        | "LIGHT"
        | "MODERATE"
        | "ACTIVE"
        | "VERY_ACTIVE";
      goal?: "LOSE_WEIGHT" | "GAIN_MUSCLE" | "MAINTAIN" | "IMPROVE_ENERGY";
      dailyCalorieTarget?: number | null;
    },
  ) {
    if (isPrototypeMode || !prisma) {
      return {
        id: userId,
        email: `${userId}@prototype.local`,
        name: data.name ?? "Prototype User",
        avatarUrl: data.avatarUrl ?? null,
        age: data.age ?? null,
        weight: data.weight ?? null,
        height: data.height ?? null,
        activityLevel: data.activityLevel ?? "MODERATE",
        goal: data.goal ?? "MAINTAIN",
        dailyCalorieTarget: data.dailyCalorieTarget ?? 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static async upsertPreferences(
    userId: string,
    data: {
      dietaryRestrictions: string[];
      allergies: string[];
      cuisinePrefs: string[];
      dislikedFoods: string[];
    },
  ) {
    if (isPrototypeMode || !prisma) {
      return {
        id: `pref-${userId}`,
        userId,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }

    return prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  static async deleteAccount(userId: string) {
    if (isPrototypeMode || !prisma) {
      return;
    }

    await prisma.user.delete({ where: { id: userId } });
  }
}
