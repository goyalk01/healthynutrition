import crypto from "crypto";
import { User } from "@prisma/client";
import { API_ERRORS } from "../../config/constants";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { LoginInput, RegisterInput } from "./auth.schema";

type SafeUser = Omit<User, "passwordHash">;

const toHttpError = (statusCode: number, message: string): Error & { statusCode: number } => {
  return Object.assign(new Error(message), { statusCode });
};

const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getExpiryDate = (duration: string): Date => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid token duration format");
  }

  const value = Number(match[1]);
  const unit = match[2];

  const result = new Date();
  const multiplier =
    unit === "s"
      ? 1_000
      : unit === "m"
        ? 60_000
        : unit === "h"
          ? 3_600_000
          : 86_400_000;

  result.setTime(result.getTime() + value * multiplier);
  return result;
};

const sanitizeUser = (user: User): SafeUser => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

const isPrototypeLoginEnabled = (): boolean => {
  return env.NODE_ENV !== "production";
};

const normalizeIdentifierToEmail = (identifier: string): string => {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) {
    return "prototype-user@prototype.local";
  }

  if (trimmed.includes("@")) {
    return trimmed;
  }

  const sanitized = trimmed.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${sanitized || "prototype-user"}@prototype.local`;
};

const displayNameFromIdentifier = (identifier: string): string => {
  const base = identifier.trim();
  if (!base) {
    return "Prototype User";
  }

  return base.slice(0, 60);
};

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw toHttpError(409, API_ERRORS.EMAIL_EXISTS);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  static async login(data: LoginInput) {
    const prototypeLogin = isPrototypeLoginEnabled();
    const normalizedEmail = normalizeIdentifierToEmail(data.email);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let authenticatedUser = user;

    if (!authenticatedUser && prototypeLogin) {
      const passwordHash = await hashPassword(data.password || "prototype");
      authenticatedUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: displayNameFromIdentifier(data.email),
          passwordHash,
        },
      });
    }

    if (!authenticatedUser) {
      throw toHttpError(401, API_ERRORS.INVALID_CREDENTIALS);
    }

    if (!prototypeLogin) {
      const passwordMatches = await comparePassword(data.password, authenticatedUser.passwordHash);
      if (!passwordMatches) {
        throw toHttpError(401, API_ERRORS.INVALID_CREDENTIALS);
      }
    }

    await prisma.refreshToken.updateMany({
      where: { userId: authenticatedUser.id, isRevoked: false },
      data: { isRevoked: true },
    });

    const accessToken = signAccessToken({
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
    });
    const refreshToken = signRefreshToken({
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
    });

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(refreshToken),
        userId: authenticatedUser.id,
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(authenticatedUser),
    };
  }

  static async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw toHttpError(401, API_ERRORS.SESSION_EXPIRED);
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: tokenHash,
        userId: payload.userId,
      },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw toHttpError(401, API_ERRORS.SESSION_EXPIRED);
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw toHttpError(401, API_ERRORS.UNAUTHORIZED);
    }

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(newRefreshToken),
        userId: user.id,
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          token: hashRefreshToken(refreshToken),
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
      return;
    }

    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw toHttpError(404, "User not found");
    }

    return sanitizeUser(user);
  }
}
