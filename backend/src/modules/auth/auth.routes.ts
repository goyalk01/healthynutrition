import { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { createErrorResponse } from "../../utils/response";
import { AuthController } from "./auth.controller";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from "./auth.schema";

const handleRouteError = (error: unknown, reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }) => {
  if (error instanceof ZodError) {
    return reply
      .code(400)
      .send(
        createErrorResponse(
          "VALIDATION_ERROR",
          error.issues.map((issue) => issue.message).join(", "),
        ),
      );
  }

  const err = error as Error & { statusCode?: number };
  const statusCode = err.statusCode ?? 500;
  const code = statusCode === 401 ? "UNAUTHORIZED" : statusCode === 409 ? "CONFLICT" : "INTERNAL_SERVER_ERROR";

  return reply
    .code(statusCode)
    .send(createErrorResponse(code, err.message || "Internal server error"));
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      try {
        request.body = registerSchema.parse(request.body);
        return await AuthController.register(request, reply);
      } catch (error) {
        return handleRouteError(error, reply);
      }
    },
  );

  fastify.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      try {
        request.body = loginSchema.parse(request.body);
        return await AuthController.login(request, reply);
      } catch (error) {
        return handleRouteError(error, reply);
      }
    },
  );

  fastify.post("/refresh", async (request, reply) => {
    try {
      const rawBody = (request.body ?? {}) as { refreshToken?: string };
      const cookieToken = request.cookies.refreshToken;
      const token = rawBody.refreshToken || cookieToken;

      request.body = refreshSchema.parse({ refreshToken: token });
      return await AuthController.refresh(request, reply);
    } catch (error) {
      return handleRouteError(error, reply);
    }
  });

  fastify.post(
    "/logout",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        request.body = logoutSchema.parse(request.body ?? {});
        return await AuthController.logout(request, reply);
      } catch (error) {
        return handleRouteError(error, reply);
      }
    },
  );

  fastify.get(
    "/me",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        return await AuthController.me(request, reply);
      } catch (error) {
        return handleRouteError(error, reply);
      }
    },
  );
};

export default authRoutes;
