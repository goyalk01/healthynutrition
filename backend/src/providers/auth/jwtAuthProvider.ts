import { AuthService } from "../../modules/auth/auth.service";
import { AuthProvider } from "./authProvider.interface";

export const jwtAuthProvider: AuthProvider = AuthService;
