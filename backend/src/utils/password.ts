import bcrypt from "bcrypt";
import { env } from "../config/env";

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash);
};
