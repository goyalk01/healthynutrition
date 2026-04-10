import { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { createErrorResponse } from "../utils/response";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .code(401)
        .send(createErrorResponse("UNAUTHORIZED", "Unauthorized"));
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    request.user = { userId: payload.userId, email: payload.email };
  } catch {
    return reply
      .code(401)
      .send(createErrorResponse("UNAUTHORIZED", "Unauthorized"));
  }
};
