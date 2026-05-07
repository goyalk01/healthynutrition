import { featureFlags } from "../../config/featureFlags";
import { MockMealsRepository } from "./mockMealsRepository";
import { MealsRepository as PrismaMealsRepo } from "./prismaMealsRepository";

export const MealsRepository = featureFlags.useMockData ? MockMealsRepository : PrismaMealsRepo;
