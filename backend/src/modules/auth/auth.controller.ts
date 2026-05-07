import { FastifyReply, FastifyRequest } from "fastify";
import { COOKIE } from "../../config/constants";
import { env } from "../../config/env";
import { sendSuccess } from "../../utils/response";
import { authProvider } from "../../providers/auth";
import { LoginInput, LogoutInput, RefreshInput, RegisterInput } from "./auth.schema";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: COOKIE.maxAge,
};

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await authProvider.register(request.body as RegisterInput);

    reply.setCookie(COOKIE.refreshToken, result.refreshToken, cookieOptions);
    return sendSuccess(reply, request, result, undefined, 201);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await authProvider.login(request.body as LoginInput);

    reply.setCookie(COOKIE.refreshToken, result.refreshToken, cookieOptions);
    return sendSuccess(reply, request, result);
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RefreshInput;
    const token = body.refreshToken || request.cookies[COOKIE.refreshToken];
    const result = await authProvider.refresh(token);

    reply.setCookie(COOKIE.refreshToken, result.refreshToken, cookieOptions);
    return sendSuccess(reply, request, result);
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as LogoutInput;
    const token = body.refreshToken || request.cookies[COOKIE.refreshToken];

    await authProvider.logout(request.user!.userId, token);
    reply.clearCookie(COOKIE.refreshToken, { path: "/" });

    return sendSuccess(reply, request, { loggedOut: true });
  }

  static async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await authProvider.me(request.user!.userId);
    return sendSuccess(reply, request, user);
  }
}
