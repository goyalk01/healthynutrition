import crypto from "crypto";
import { User } from "@prisma/client";
import { API_ERRORS } from "../../config/constants";
import { env } from "../../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";
import { AuthRepository } from "./auth.repository";
import { LoginInput, RegisterInput } from "./auth.schema";

type SafeUser = Omit<User, "passwordHash">;

const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const parseDuration = (duration: string): Date => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new InternalError("Invalid token duration format");

  const ms =
    Number(match[1]) *
    ({ s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"]!);

  return new Date(Date.now() + ms);
};

const sanitizeUser = (user: User): SafeUser => {
  const { passwordHash: _, ...safe } = user;
  return safe;
};

/**
 * Auth service — pure business logic, no direct Prisma usage.
 */
export class AuthService {
  static async register(data: RegisterInput) {
    const existing = await AuthRepository.findUserByEmail(data.email);
    if (existing) throw new ConflictError(API_ERRORS.EMAIL_EXISTS);

    const user = await AuthRepository.createUser({
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      passwordHash: await hashPassword(data.password),
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await AuthRepository.createRefreshToken({
      token: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: parseDuration(env.JWT_REFRESH_EXPIRES),
    });

    return { accessToken, refreshToken, user: sanitizeUser(user) };
  }

  static async login(data: LoginInput) {
    const email = data.email.toLowerCase().trim();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new UnauthorizedError(API_ERRORS.INVALID_CREDENTIALS);

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError(API_ERRORS.INVALID_CREDENTIALS);

    await AuthRepository.revokeAllUserTokens(user.id);

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await AuthRepository.createRefreshToken({
      token: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: parseDuration(env.JWT_REFRESH_EXPIRES),
    });

    return { accessToken, refreshToken, user: sanitizeUser(user) };
  }

  static async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedError(API_ERRORS.SESSION_EXPIRED);

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const record = await AuthRepository.findRefreshToken(tokenHash, payload.userId);
    if (!record || record.isRevoked || record.expiresAt < new Date()) {
      throw new UnauthorizedError(API_ERRORS.SESSION_EXPIRED);
    }

    await AuthRepository.revokeRefreshToken(record.id);

    const user = await AuthRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedError(API_ERRORS.UNAUTHORIZED);

    const newAccess = signAccessToken({ userId: user.id, email: user.email });
    const newRefresh = signRefreshToken({ userId: user.id, email: user.email });

    await AuthRepository.createRefreshToken({
      token: hashRefreshToken(newRefresh),
      userId: user.id,
      expiresAt: parseDuration(env.JWT_REFRESH_EXPIRES),
    });

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await AuthRepository.revokeSpecificToken(userId, hashRefreshToken(refreshToken));
    } else {
      await AuthRepository.revokeAllUserTokens(userId);
    }
  }

  static async me(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User");
    return sanitizeUser(user);
  }
}
