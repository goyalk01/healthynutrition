# NutriSense

AI-powered Food & Health platform scaffold.

## Stack

- Frontend: Next.js 14 + TypeScript + Tailwind + Zustand + React Query
- Backend: Fastify + Prisma + PostgreSQL + Redis + Zod + JWT
- Infra: Docker Compose local, Cloud Run + Cloud SQL target

## Local Run

1. Start infra:
   - `docker compose up -d`
2. Start backend (in `backend`):
   - `npm install`
   - `npm run dev`
3. Start frontend (in `frontend`):
   - `npm install`
   - `npm run dev`
