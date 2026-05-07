import { FastifyPluginAsync } from "fastify";
import { COOKIE, RATE_LIMIT } from "../../config/constants";
import { authenticate } from "../../middleware/authenticate";
import { AuthController } from "./auth.controller";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from "./auth.schema";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: RATE_LIMIT.authMax,
          timeWindow: RATE_LIMIT.authWindow,
        },
      },
      schema: {
        tags: ["Auth"],
        summary: "Register a new user",
      },
    },
    async (request, reply) => {
      request.body = registerSchema.parse(request.body);
      return AuthController.register(request, reply);
    },
  );

  fastify.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: RATE_LIMIT.authMax,
          timeWindow: RATE_LIMIT.authWindow,
        },
      },
      schema: {
        tags: ["Auth"],
        summary: "Login with email and password",
      },
    },
    async (request, reply) => {
      request.body = loginSchema.parse(request.body);
      return AuthController.login(request, reply);
    },
  );

  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["Auth"],
        summary: "Rotate refresh/access tokens",
      },
    },
    async (request, reply) => {
      const rawBody = (request.body ?? {}) as { refreshToken?: string };
      const cookieToken = request.cookies[COOKIE.refreshToken];
      const token = rawBody.refreshToken || cookieToken;

      request.body = refreshSchema.parse({ refreshToken: token });
      return AuthController.refresh(request, reply);
    },
  );

  fastify.post(
    "/logout",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Logout current user",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.body = logoutSchema.parse(request.body ?? {});
      return AuthController.logout(request, reply);
    },
  );

  fastify.get(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      return AuthController.me(request, reply);
    },
  );
};

export default authRoutes;
