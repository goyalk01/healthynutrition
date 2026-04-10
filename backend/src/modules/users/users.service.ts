import { prisma } from "../../config/database";

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

export class UsersService {
  static async getProfile(userId: string) {
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
    return prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}
