import { RecommendationType } from "@prisma/client";
import { z } from "zod";

export const recommendationCreateSchema = z.object({
  type: z.nativeEnum(RecommendationType),
  title: z.string().min(3),
  description: z.string().min(3),
  data: z.record(z.any()).default({}),
  score: z.number().min(0).max(1).default(0.5),
});
