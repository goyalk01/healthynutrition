import { User, RefreshToken } from "@prisma/client";
import { prisma } from "../../config/database";

/**
 * Auth repository — sole owner of auth-related DB queries.
 *
 * Services call repository methods; they never import prisma directly.
 * This decouples business logic from the ORM, making it testable
 * and swappable.
 */
export class AuthRepository {
  static findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static createUser(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({ data });
  }

  static createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  static findRefreshToken(tokenHash: string, userId: string) {
    return prisma.refreshToken.findFirst({
      where: { token: tokenHash, userId },
    });
  }

  static revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  static revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  static revokeSpecificToken(userId: string, tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, token: tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
