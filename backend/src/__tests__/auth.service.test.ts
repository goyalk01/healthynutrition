/**
 * Auth service unit tests.
 *
 * These tests verify business logic by mocking the repository layer.
 * No database or network is needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../modules/auth/auth.service";
import { AuthRepository } from "../modules/auth/auth.repository";
import * as passwordUtils from "../utils/password";
import * as jwtUtils from "../utils/jwt";
import { createMockUser, createMockRefreshToken } from "./helpers";

// Mock the repository — this is what the service depends on
vi.mock("../modules/auth/auth.repository");
vi.mock("../utils/password");
vi.mock("../utils/jwt");
vi.mock("../config/env", () => ({
  env: {
    NODE_ENV: "test",
    APP_MODE: "development",
    JWT_ACCESS_SECRET: "a".repeat(64),
    JWT_REFRESH_SECRET: "b".repeat(64),
    JWT_ACCESS_EXPIRES: "15m",
    JWT_REFRESH_EXPIRES: "7d",
    BCRYPT_ROUNDS: 4,
    APP_NAME: "test",
    HOST: "0.0.0.0",
    PORT: 8080,
    SHUTDOWN_TIMEOUT_MS: 10000,
    DATABASE_URL: "test",
    REDIS_URL: "test",
    CORS_ORIGIN: "http://localhost:3000",
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_WINDOW: 60000,
    MAX_BODY_SIZE: 1048576,
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Register ─────────────────────────────────────────────────
  describe("register", () => {
    it("should create a new user and return tokens", async () => {
      const mockUser = createMockUser();

      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(AuthRepository.createUser).mockResolvedValue(mockUser);
      vi.mocked(AuthRepository.createRefreshToken).mockResolvedValue(
        createMockRefreshToken() as any,
      );
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue("hashed");
      vi.mocked(jwtUtils.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("refresh-token");

      const result = await AuthService.register({
        email: "test@example.com",
        password: "Password1",
        name: "Test User",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user.email).toBe("test@example.com");
      expect(AuthRepository.createUser).toHaveBeenCalledOnce();
    });

    it("should throw ConflictError when email already exists", async () => {
      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(createMockUser());

      await expect(
        AuthService.register({
          email: "test@example.com",
          password: "Password1",
          name: "Test User",
        }),
      ).rejects.toThrow("Email already registered");
    });

    it("should normalize email to lowercase and trim", async () => {
      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(AuthRepository.createUser).mockResolvedValue(createMockUser());
      vi.mocked(AuthRepository.createRefreshToken).mockResolvedValue(
        createMockRefreshToken() as any,
      );
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue("hashed");
      vi.mocked(jwtUtils.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("refresh-token");

      await AuthService.register({
        email: "  Test@Example.COM  ",
        password: "Password1",
        name: "  Test User  ",
      });

      expect(AuthRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          name: "Test User",
        }),
      );
    });
  });

  // ── Login ────────────────────────────────────────────────────
  describe("login", () => {
    it("should return tokens on valid credentials", async () => {
      const mockUser = createMockUser();

      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(AuthRepository.revokeAllUserTokens).mockResolvedValue({ count: 0 } as any);
      vi.mocked(AuthRepository.createRefreshToken).mockResolvedValue(
        createMockRefreshToken() as any,
      );
      vi.mocked(jwtUtils.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("refresh-token");

      const result = await AuthService.login({
        email: "test@example.com",
        password: "Password1",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("should throw UnauthorizedError on wrong password", async () => {
      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(createMockUser());
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

      await expect(
        AuthService.login({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw UnauthorizedError when user not found", async () => {
      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(null);

      await expect(
        AuthService.login({ email: "no@user.com", password: "Password1" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should revoke existing tokens on login", async () => {
      vi.mocked(AuthRepository.findUserByEmail).mockResolvedValue(createMockUser());
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(AuthRepository.revokeAllUserTokens).mockResolvedValue({ count: 2 } as any);
      vi.mocked(AuthRepository.createRefreshToken).mockResolvedValue(
        createMockRefreshToken() as any,
      );
      vi.mocked(jwtUtils.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("refresh-token");

      await AuthService.login({ email: "test@example.com", password: "Password1" });

      expect(AuthRepository.revokeAllUserTokens).toHaveBeenCalledWith("test-user-id");
    });
  });

  // ── Refresh ──────────────────────────────────────────────────
  describe("refresh", () => {
    it("should throw when no token provided", async () => {
      await expect(AuthService.refresh(undefined)).rejects.toThrow("Session expired");
    });

    it("should throw when token is revoked", async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({
        userId: "test-user-id",
        tokenType: "refresh",
      });
      vi.mocked(AuthRepository.findRefreshToken).mockResolvedValue(
        createMockRefreshToken({ isRevoked: true }) as any,
      );

      await expect(AuthService.refresh("some-token")).rejects.toThrow("Session expired");
    });
  });

  // ── Logout ───────────────────────────────────────────────────
  describe("logout", () => {
    it("should revoke specific token when provided", async () => {
      vi.mocked(AuthRepository.revokeSpecificToken).mockResolvedValue({ count: 1 } as any);

      await AuthService.logout("test-user-id", "some-refresh-token");

      expect(AuthRepository.revokeSpecificToken).toHaveBeenCalledOnce();
    });

    it("should revoke all tokens when no specific token", async () => {
      vi.mocked(AuthRepository.revokeAllUserTokens).mockResolvedValue({ count: 3 } as any);

      await AuthService.logout("test-user-id");

      expect(AuthRepository.revokeAllUserTokens).toHaveBeenCalledWith("test-user-id");
    });
  });

  // ── Me ───────────────────────────────────────────────────────
  describe("me", () => {
    it("should return user without passwordHash", async () => {
      vi.mocked(AuthRepository.findUserById).mockResolvedValue(createMockUser());

      const result = await AuthService.me("test-user-id");

      expect(result).not.toHaveProperty("passwordHash");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw NotFoundError when user missing", async () => {
      vi.mocked(AuthRepository.findUserById).mockResolvedValue(null);

      await expect(AuthService.me("missing-id")).rejects.toThrow("User not found");
    });
  });
});
