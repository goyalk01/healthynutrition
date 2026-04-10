import { FastifyPluginAsync } from "fastify";

export const requestLoggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
      },
      "Incoming request",
    );
  });
};
