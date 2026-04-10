import { FastifyReply, FastifyRequest } from "fastify";
import { COOKIE_KEYS } from "../../config/constants";
import { env } from "../../config/env";
import { createSuccessResponse } from "../../utils/response";
import { AuthService } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.register(request.body as never);

    reply.setCookie(COOKIE_KEYS.refreshToken, result.refreshToken, cookieOptions);
    return reply.code(201).send(createSuccessResponse(result));
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.login(request.body as never);

    reply.setCookie(COOKIE_KEYS.refreshToken, result.refreshToken, cookieOptions);
    return reply.send(createSuccessResponse(result));
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { refreshToken?: string };
    const token = body.refreshToken || request.cookies[COOKIE_KEYS.refreshToken];
    const result = await AuthService.refresh(token);

    reply.setCookie(COOKIE_KEYS.refreshToken, result.refreshToken, cookieOptions);
    return reply.send(createSuccessResponse(result));
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { refreshToken?: string };
    const token = body.refreshToken || request.cookies[COOKIE_KEYS.refreshToken];

    await AuthService.logout(request.user!.userId, token);
    reply.clearCookie(COOKIE_KEYS.refreshToken, { path: "/" });

    return reply.send(createSuccessResponse({ loggedOut: true }));
  }

  static async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await AuthService.me(request.user!.userId);
    return reply.send(createSuccessResponse(user));
  }
}
