"use client";

import { useQuery } from "@tanstack/react-query";
import { listHabits } from "../api/habits.api";

export const useHabits = () => {
  return useQuery({
    queryKey: ["habits"],
    queryFn: listHabits,
  });
};
