"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type Habit = {
  id: string;
  name: string;
  targetCount: number;
  isActive: boolean;
};

export const useHabits = () => {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const response = await api.get("/habits");
      return response.data.data as Habit[];
    },
  });
};
