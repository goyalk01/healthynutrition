import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import { UsersController } from "./users.controller";
import { preferencesSchema, profileSchema } from "./users.schema";

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/profile",
    {
      schema: {
        tags: ["Users"],
        summary: "Get user profile",
        security: [{ bearerAuth: [] }],
      },
    },
    UsersController.getProfile,
  );

  fastify.patch(
    "/profile",
    {
      schema: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.body = profileSchema.parse(request.body);
      return UsersController.updateProfile(request, reply);
    },
  );

  fastify.put(
    "/preferences",
    {
      schema: {
        tags: ["Users"],
        summary: "Update user preferences",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      request.body = preferencesSchema.parse(request.body);
      return UsersController.updatePreferences(request, reply);
    },
  );

  fastify.delete(
    "/account",
    {
      schema: {
        tags: ["Users"],
        summary: "Delete user account",
        security: [{ bearerAuth: [] }],
      },
    },
    UsersController.deleteAccount,
  );
};

export default usersRoutes;
