import { featureFlags } from "../../config/featureFlags";
import { jwtAuthProvider } from "./jwtAuthProvider";
import { mockAuthProvider } from "./mockAuthProvider";
import { AuthProvider } from "./authProvider.interface";

export const authProvider: AuthProvider = featureFlags.useMockAuth
  ? mockAuthProvider
  : jwtAuthProvider;
