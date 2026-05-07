import jwt from "jsonwebtoken";
import { API_ERRORS } from "../config/constants";
import { env } from "../config/env";
import { UnauthorizedError } from "./errors";

type BaseTokenPayload = {
  userId: string;
  email?: string;
};

export type AccessTokenPayload = BaseTokenPayload & { tokenType: "access" };
export type RefreshTokenPayload = BaseTokenPayload & { tokenType: "refresh" };

const algorithm: jwt.Algorithm = "HS256";

const signToken = <T extends AccessTokenPayload | RefreshTokenPayload>(
  payload: T,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, {
    algorithm,
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

const verifyToken = <T extends AccessTokenPayload | RefreshTokenPayload>(
  token: string,
  secret: string,
): T => {
  try {
    return jwt.verify(token, secret, {
      algorithms: [algorithm],
    }) as T;
  } catch {
    throw new UnauthorizedError(API_ERRORS.UNAUTHORIZED);
  }
};

export const signAccessToken = (payload: BaseTokenPayload): string => {
  return signToken(
    { ...payload, tokenType: "access" },
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES,
  );
};

export const signRefreshToken = (payload: BaseTokenPayload): string => {
  return signToken(
    { ...payload, tokenType: "refresh" },
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES,
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = verifyToken<AccessTokenPayload>(token, env.JWT_ACCESS_SECRET);
  if (payload.tokenType !== "access") {
    throw new UnauthorizedError(API_ERRORS.UNAUTHORIZED);
  }

  return payload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = verifyToken<RefreshTokenPayload>(token, env.JWT_REFRESH_SECRET);
  if (payload.tokenType !== "refresh") {
    throw new UnauthorizedError(API_ERRORS.UNAUTHORIZED);
  }

  return payload;
};
