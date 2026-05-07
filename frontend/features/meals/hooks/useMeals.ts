"use client";

import { useQuery } from "@tanstack/react-query";
import { listMeals } from "../api/meals.api";

export const useMeals = () => {
  return useQuery({
    queryKey: ["meals"],
    queryFn: listMeals,
  });
};
