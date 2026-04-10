import { env } from "./env";

export const isPrototypeMode = env.PROTOTYPE_MODE || !env.DATABASE_URL;
export const isDatabaseEnabled = Boolean(env.DATABASE_URL) && !isPrototypeMode;
export const isRedisEnabled = Boolean(env.REDIS_URL);
