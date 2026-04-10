const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new (options?: Record<string, unknown>) => any;
};
import { isDatabaseEnabled } from "./runtime";

const globalForPrisma = globalThis as unknown as { prisma?: any };

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

export const prisma = isDatabaseEnabled
  ? globalForPrisma.prisma ?? createPrismaClient()
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
