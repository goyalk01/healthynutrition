import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import { env } from "./env";

/**
 * OpenAPI documentation configuration.
 *
 * Registers Swagger spec generation and Swagger UI at /docs.
 * Only the UI is exposed in development; the JSON spec is always available
 * at /docs/json for CI or external tooling.
 */
export const registerSwagger = async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "NutriSense API",
        description:
          "AI-powered Food & Health intelligence API for meals, habits, and personalized nutrition insights.",
        version: "1.0.0",
        contact: {
          name: "NutriSense Team",
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Local development",
        },
      ],
      tags: [
        { name: "Auth", description: "Authentication & session management" },
        { name: "Users", description: "User profiles & preferences" },
        { name: "Meals", description: "Meal CRUD & search" },
        { name: "Habits", description: "Habit tracking" },
        { name: "Logs", description: "Meal & habit logging" },
        { name: "Recommendations", description: "AI-powered nutrition recommendations" },
        { name: "Health", description: "Liveness & readiness probes" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token obtained from /api/v1/auth/login",
          },
        },
        schemas: {
          SuccessResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
              requestId: { type: "string", format: "uuid" },
            },
          },
          ErrorResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: {
                type: "object",
                properties: {
                  code: { type: "string", example: "VALIDATION_ERROR" },
                  message: { type: "string", example: "email: Invalid email" },
                },
              },
              requestId: { type: "string", format: "uuid" },
            },
          },
          PaginationMeta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 42 },
              totalPages: { type: "integer", example: 3 },
            },
          },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      persistAuthorization: true,
    },
  });
};
