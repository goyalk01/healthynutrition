import { AuthProvider } from "./authProvider.interface";
import { LoginInput, RegisterInput } from "../../modules/auth/auth.schema";

export const mockAuthProvider: AuthProvider = {
  async register(data: RegisterInput) {
    return {
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email: data.email,
        name: data.name,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  },

  async login(data: LoginInput) {
    return {
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email: data.email,
        name: "Demo User",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  },

  async refresh(refreshToken?: string) {
    return {
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
    };
  },

  async logout(userId: string, refreshToken?: string) {
    return;
  },

  async me(userId: string) {
    return {
      id: userId || "mock-user-id",
      email: "demo@nutrisense.local",
      name: "Demo User",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
};
