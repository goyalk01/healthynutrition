import { AuthSession, AuthUser } from "./types/auth.types";

export const DEMO_AUTH_USER: AuthUser = {
  id: "mock-user-id",
  email: "demo@nutrisense.local",
  name: "Demo User",
  avatarUrl: null,
  age: 24,
  weight: 70,
  height: 172,
};

export const createDemoAuthSession = (): AuthSession => ({
  accessToken: "mock-token",
  refreshToken: "mock-refresh-token",
  user: DEMO_AUTH_USER,
});
