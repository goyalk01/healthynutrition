"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: "MEAL" | "HABIT" | "INSIGHT" | "ALERT";
  score: number;
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const response = await api.get("/recommendations");
      return response.data.data as Recommendation[];
    },
  });
};
