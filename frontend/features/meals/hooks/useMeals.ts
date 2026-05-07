"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeArray } from "@/shared/api/normalize";
import { Meal } from "../types/meal.types";
import { listMeals } from "../api/meals.api";

export const useMeals = () => {
  return useQuery<Meal[]>({
    queryKey: ["meals"],
    queryFn: async () => normalizeArray<Meal>(await listMeals()),
    initialData: [],
  });
};
