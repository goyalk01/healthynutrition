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

    // Parse JSON string arrays in preferences
    if (safeUser.userPreferences) {
      const prefs = safeUser.userPreferences;
      safeUser.userPreferences = {
        ...prefs,
        dietaryRestrictions: typeof prefs.dietaryRestrictions === "string" ? JSON.parse(prefs.dietaryRestrictions) : prefs.dietaryRestrictions,
        allergies: typeof prefs.allergies === "string" ? JSON.parse(prefs.allergies) : prefs.allergies,
        cuisinePrefs: typeof prefs.cuisinePrefs === "string" ? JSON.parse(prefs.cuisinePrefs) : prefs.cuisinePrefs,
        dislikedFoods: typeof prefs.dislikedFoods === "string" ? JSON.parse(prefs.dislikedFoods) : prefs.dislikedFoods,
      };
    }

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
      activityLevel?: string;
      goal?: string;
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
    // Serialize arrays to JSON strings for SQLite
    const serialized = {
      dietaryRestrictions: JSON.stringify(data.dietaryRestrictions),
      allergies: JSON.stringify(data.allergies),
      cuisinePrefs: JSON.stringify(data.cuisinePrefs),
      dislikedFoods: JSON.stringify(data.dislikedFoods),
    };

    return prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...serialized },
      update: serialized,
    });
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}
