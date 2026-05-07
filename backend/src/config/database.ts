import { PrismaClient } from "@prisma/client";
import { featureFlags } from "./featureFlags";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Export a dummy object or actual PrismaClient based on feature flags/URL
export const prisma =
  globalForPrisma.prisma ??
  (featureFlags.requireDatabase || process.env.DATABASE_URL
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    : ({} as PrismaClient));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
