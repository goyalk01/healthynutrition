FROM node:20-bookworm-slim AS base
WORKDIR /app

ENV NODE_ENV=production

# Required for Prisma runtime and proper signal handling in containers
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates dumb-init \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM base AS runner
ENV PORT=8080

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/app.js"]
