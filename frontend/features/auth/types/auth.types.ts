export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type AuthSession = AuthTokens & {
  user: AuthUser;
};
