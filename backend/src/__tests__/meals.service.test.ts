import { beforeEach, describe, expect, it, vi } from "vitest";
import { MealsRepository } from "../modules/meals/meals.repository";
import { MealsService } from "../modules/meals/meals.service";

vi.mock("../modules/meals/meals.repository");

describe("MealsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with parsed tags", async () => {
    vi.mocked(MealsRepository.findMany).mockResolvedValue([
      [
        {
          id: "meal-1",
          userId: "user-1",
          name: "Meal",
          description: null,
          calories: 400,
          protein: 30,
          carbs: 40,
          fat: 10,
          fiber: null,
          sugar: null,
          mealType: "LUNCH",
          imageUrl: null,
          tags: ["healthy"],
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      1,
    ] as any);

    const result = await MealsService.list("user-1", {
      page: 1,
      limit: 20,
    });

    expect(result.items[0].tags).toEqual(["healthy"]);
    expect(result.pagination.total).toBe(1);
  });

  it("returns empty search result for blank query", async () => {
    const result = await MealsService.search("user-1", "   ");
    expect(result).toEqual([]);
    expect(MealsRepository.search).not.toHaveBeenCalled();
  });

  it("passes tags as array before create", async () => {
    vi.mocked(MealsRepository.create).mockResolvedValue({ id: "meal-1" } as any);

    await MealsService.create("user-1", {
      name: "Meal",
      calories: 500,
      protein: 30,
      carbs: 60,
      fat: 15,
      mealType: "DINNER",
      tags: ["tag-a"],
    });

    expect(MealsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ["tag-a"],
      }),
    );
  });
});
