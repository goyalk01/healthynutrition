const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new (options?: Record<string, unknown>) => any;
};

const globalForPrisma = globalThis as unknown as { prisma?: any };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
