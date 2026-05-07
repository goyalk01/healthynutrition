import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      email?: string;
    };
    /** Unique trace ID for this request (set by requestLogger middleware). */
    requestId: string;
    /** High-resolution start time (set by requestLogger middleware). */
    startTime: bigint;
  }
}

export {};
