import { FastifyReply, FastifyRequest } from "fastify";
import { API_ERRORS } from "../config/constants";
import { UnauthorizedError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";
import { featureFlags } from "../config/featureFlags";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  
  if (featureFlags.useMockAuth) {
    if (!authHeader || authHeader === "Bearer mock-token" || authHeader === "Bearer ") {
      request.user = { userId: "mock-user-id", email: "demo@nutrisense.local" };
      return;
    }
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(API_ERRORS.UNAUTHORIZED);
  }

  const token = authHeader.slice(7);
  if (featureFlags.useMockAuth && token === "mock-token") {
     request.user = { userId: "mock-user-id", email: "demo@nutrisense.local" };
     return;
  }

  const payload = verifyAccessToken(token);
  request.user = { userId: payload.userId, email: payload.email };
};
