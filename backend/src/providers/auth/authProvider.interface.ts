import { LoginInput, RegisterInput } from "../../modules/auth/auth.schema";

export interface AuthProvider {
  register(data: RegisterInput): Promise<any>;
  login(data: LoginInput): Promise<any>;
  refresh(refreshToken?: string): Promise<any>;
  logout(userId: string, refreshToken?: string): Promise<void>;
  me(userId: string): Promise<any>;
}
