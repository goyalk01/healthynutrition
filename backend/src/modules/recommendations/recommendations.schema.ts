import { z } from "zod";

export const recommendationGenerateSchema = z.object({
  persist: z.boolean().default(true),
});

export type RecommendationGenerateInput = z.infer<typeof recommendationGenerateSchema>;
