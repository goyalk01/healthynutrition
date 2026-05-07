"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeArray } from "@/shared/api/normalize";
import { Recommendation } from "../types/recommendation.types";
import { listRecommendations } from "../api/recommendations.api";

export const useRecommendations = () => {
  return useQuery<Recommendation[]>({
    queryKey: ["recommendations"],
    queryFn: async () =>
      normalizeArray<Recommendation>(await listRecommendations()),
    initialData: [],
  });
};
