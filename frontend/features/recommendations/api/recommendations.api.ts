import apiClient from "@/shared/api/client.browser";
import { normalizeArray } from "@/shared/api/normalize";
import { unwrapApiResponse } from "@/shared/api/response";
import { ApiResponse } from "@/shared/types/api";
import { Recommendation } from "../types/recommendation.types";

export const listRecommendations = async (): Promise<Recommendation[]> => {
  const response =
    await apiClient.get<ApiResponse<Recommendation[]>>("/recommendations");
  return normalizeArray<Recommendation>(unwrapApiResponse(response));
};
