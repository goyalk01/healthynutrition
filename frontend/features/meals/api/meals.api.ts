import apiClient from "@/shared/api/client";
import { unwrapApiResponse } from "@/shared/api/response";
import { ApiResponse, PaginatedResult } from "@/shared/types/api";
import { Meal } from "../types/meal.types";

export const listMeals = async (): Promise<Meal[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedResult<Meal>>>("/meals");
  return unwrapApiResponse(response).items;
};
