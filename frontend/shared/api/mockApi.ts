import { InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import { createDemoAuthSession, DEMO_AUTH_USER } from "@/features/auth/mockSession";
import { AuthSession, AuthUser } from "@/features/auth/types/auth.types";
import { Habit } from "@/features/habits/types/habit.types";
import { Meal } from "@/features/meals/types/meal.types";
import { Recommendation } from "@/features/recommendations/types/recommendation.types";
import { PaginatedResult } from "../types/api";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
  createAxiosMockResponse,
} from "./response";

const mealSchema: z.ZodType<Meal> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  mealType: z.enum([
    "BREAKFAST",
    "LUNCH",
    "DINNER",
    "SNACK",
    "PRE_WORKOUT",
    "POST_WORKOUT",
  ]),
  tags: z.array(z.string()),
  createdAt: z.string(),
});

const habitSchema: z.ZodType<Habit> = z.object({
  id: z.string(),
  name: z.string(),
  targetCount: z.number(),
  isActive: z.boolean(),
});

const recommendationSchema: z.ZodType<Recommendation> = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["MEAL", "HABIT", "INSIGHT", "ALERT"]),
  score: z.number(),
});

const authUserSchema: z.ZodType<AuthUser> = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
  age: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

const authSessionSchema: z.ZodType<AuthSession> = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  user: authUserSchema,
});

const paginatedMealsSchema: z.ZodType<PaginatedResult<Meal>> = z.object({
  items: z.array(mealSchema),
  pagination: z.object({
    page: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

const parseMockData = <T>(
  schema: z.ZodType<T>,
  value: unknown,
  label: string,
): T => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const reason = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid mock ${label}: ${reason}`);
  }
  return parsed.data;
};

const mockMeals: Meal[] = [
  {
    id: "mock-meal-1",
    name: "Demo Protein Bowl",
    description: "Lean protein, brown rice, and vegetables",
    calories: 520,
    protein: 38,
    carbs: 48,
    fat: 16,
    mealType: "LUNCH",
    tags: ["high-protein", "demo"],
    createdAt: new Date().toISOString(),
  },
];

const mockHabits: Habit[] = [
  {
    id: "mock-habit-1",
    name: "Drink Water",
    targetCount: 8,
    isActive: true,
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "mock-rec-1",
    title: "Great hydration baseline",
    description: "Keep logging water intake for stronger daily consistency.",
    type: "INSIGHT",
    score: 0.82,
  },
];

const normalizeUrlPath = (url: string): string => {
  const withoutQuery = url.split("?")[0] || "";
  if (withoutQuery.startsWith("http://") || withoutQuery.startsWith("https://")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return withoutQuery;
    }
  }
  return withoutQuery;
};

export const handleMockApiResponse = (config: InternalAxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  const path = normalizeUrlPath(config.url || "");
  const demoSession = parseMockData(authSessionSchema, createDemoAuthSession(), "auth session");

  if (method === "post" && path.includes("/auth/login")) {
    return createAxiosMockResponse(
      config,
      createApiSuccessResponse(demoSession, "Mock login success"),
    );
  }

  if (method === "post" && path.includes("/auth/register")) {
    return createAxiosMockResponse(
      config,
      createApiSuccessResponse(demoSession, "Mock register success"),
      { status: 201, statusText: "Created" },
    );
  }

  if (method === "post" && path.includes("/auth/refresh")) {
    return createAxiosMockResponse(
      config,
      createApiSuccessResponse({
        accessToken: demoSession.accessToken,
        refreshToken: demoSession.refreshToken,
      }),
    );
  }

  if (method === "get" && path.includes("/auth/me")) {
    const user = parseMockData(authUserSchema, DEMO_AUTH_USER, "auth user");
    return createAxiosMockResponse(config, createApiSuccessResponse(user));
  }

  if (method === "post" && path.includes("/auth/logout")) {
    return createAxiosMockResponse(
      config,
      createApiSuccessResponse({ loggedOut: true as const }),
    );
  }

  if (method === "get" && path.includes("/meals")) {
    const meals = parseMockData(z.array(mealSchema), mockMeals, "meals list");
    const paginatedMeals = parseMockData(
      paginatedMealsSchema,
      {
        items: meals,
        pagination: {
          page: 1,
          limit: meals.length,
          total: meals.length,
          totalPages: meals.length > 0 ? 1 : 0,
        },
      },
      "paginated meals",
    );
    return createAxiosMockResponse(config, createApiSuccessResponse(paginatedMeals));
  }

  if (method === "get" && path.includes("/habits")) {
    const habits = parseMockData(z.array(habitSchema), mockHabits, "habits list");
    return createAxiosMockResponse(config, createApiSuccessResponse(habits));
  }

  if (method === "get" && path.includes("/recommendations")) {
    const recommendations = parseMockData(
      z.array(recommendationSchema),
      mockRecommendations,
      "recommendations list",
    );
    return createAxiosMockResponse(
      config,
      createApiSuccessResponse(recommendations),
    );
  }

  return createAxiosMockResponse(
    config,
    createApiErrorResponse(
      "MOCK_ENDPOINT_NOT_IMPLEMENTED",
      `No mock handler found for ${method.toUpperCase()} ${path}`,
    ),
    {
      status: 404,
      statusText: "Not Found",
    },
  );
};
