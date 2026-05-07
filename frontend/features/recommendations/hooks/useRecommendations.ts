"use client";

import { useQuery } from "@tanstack/react-query";
import { listRecommendations } from "../api/recommendations.api";

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: listRecommendations,
  });
};
