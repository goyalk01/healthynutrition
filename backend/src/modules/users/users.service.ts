import { NotFoundError } from "../../utils/errors";
import { API_ERRORS } from "../../config/constants";
import { UsersRepository } from "./users.repository";

/**
 * Users service — delegates DB to UsersRepository.
 */
export class UsersService {
  static async getProfile(userId: string) {
    const user = await UsersRepository.findById(userId);
    if (!user) throw new NotFoundError("User", API_ERRORS.USER_NOT_FOUND);

    const { passwordHash: _, ...safe } = user;

      return safe;

    return safe;
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
    const user = await UsersRepository.update(userId, data);
    const { passwordHash: _, ...safe } = user;
    return safe;
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
    return UsersRepository.upsertPreferences(userId, data);
  }

  static async deleteAccount(userId: string) {
    await UsersRepository.delete(userId);
  }
}
