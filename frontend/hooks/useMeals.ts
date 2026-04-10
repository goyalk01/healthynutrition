"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Meal } from "@/types/meal.types";

export const useMeals = () => {
  return useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const response = await api.get("/meals");
      return response.data.data.items as Meal[];
    },
  });
};
