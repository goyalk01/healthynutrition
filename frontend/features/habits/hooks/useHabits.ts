"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeArray } from "@/shared/api/normalize";
import { Habit } from "../types/habit.types";
import { listHabits } from "../api/habits.api";

export const useHabits = () => {
  return useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => normalizeArray<Habit>(await listHabits()),
    initialData: [],
  });
};
