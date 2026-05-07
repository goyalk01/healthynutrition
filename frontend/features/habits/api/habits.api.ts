import apiClient from "@/shared/api/client.browser";
import { normalizeArray } from "@/shared/api/normalize";
import { unwrapApiResponse } from "@/shared/api/response";
import { ApiResponse } from "@/shared/types/api";
import { Habit } from "../types/habit.types";

export const listHabits = async (): Promise<Habit[]> => {
  const response = await apiClient.get<ApiResponse<Habit[]>>("/habits");
  return normalizeArray<Habit>(unwrapApiResponse(response));
};
