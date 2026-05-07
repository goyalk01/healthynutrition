# NutriSense

AI-powered Food & Health platform for tracking meals, habits, and personalized nutrition insights.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                    │
│  features/ → hooks/ → shared/api/client.ts → Backend API        │
│  Zustand (auth state) · React Query (server state)              │
│  Dual Mode: Mock API Fallback (Dev) / Axios Client (Prod)       │
├─────────────────────────────────────────────────────────────────┤
│                        Backend (Fastify)                         │
│  routes → controller → service → providers (auth, storage)       │
│  Dual Mode: Mock Data / Fake Auth (Dev) vs Prisma / JWT (Prod)  │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (data)  ·  Redis (rate-limit / cache)               │
└─────────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular monolith** | Right complexity for an MVP — avoids microservice overhead |
| **Dual-Mode Architecture** | `APP_MODE=development` for instant, offline, DB-less UI prototyping |
| **Provider Abstraction** | Swap `MockAuthProvider`/`JwtAuthProvider` automatically based on mode |
| **Config-driven AI engine** | Tune recommendations via `nutrition.ts`, never engine code |
| **Zod schemas at route level** | Input validation before controllers; typed end-to-end |
| **Enterprise error hierarchy** | `AppError` subclasses avoid magic status codes in services |
| **Feature-based frontend** | Each domain (auth, meals, habits) is self-contained |
| **PostgreSQL Native Arrays** | Uses `String[]` instead of stringified JSON for indexed, O(1) text search scalability |
| **Defensive Pagination Caps** | Strict OOM prevention (`Math.min(take, 100)`) on all paginated database queries |

## Stack

- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS · Zustand · React Query · Framer Motion · Recharts
- **Backend**: Fastify · Prisma · PostgreSQL · Redis · Zod · JWT · Pino
- **Infra**: Docker Compose (local) · Cloud Run + Cloud SQL (production)
- **Testing**: Vitest unit tests (auth, meals, recommendation engine, utilities)
- **CI/CD**: GitHub Actions (architecture lint, lint, typecheck, test, build)
- **Docs**: OpenAPI 3.1 / Swagger UI at `/docs`

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL + Redis)

## Quick Start

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Set up backend

```bash
cd backend
cp .env.example .env
# Edit .env — generate JWT secrets: openssl rand -hex 32
npm install
npx prisma migrate dev
npm run dev
```

### 3. Seed demo data (optional)

```bash
npm run prisma:seed
```

Demo accounts after seeding:

| Email | Password |
|-------|----------|
| `alice@nutrisense.demo` | `Password1` |
| `bob@nutrisense.demo` | `Password1` |

### 4. Set up frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 5. Access

- **App**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Readiness Probe**: [http://localhost:8080/ready](http://localhost:8080/ready)

## Testing

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

**Test coverage:**

| Module | Tests | Coverage |
|--------|-------|----------|
| Auth service | Unit tests | Register, login, refresh, logout, me |
| Meals service | Unit tests | Pagination, tag parsing, search behavior |
| Recommendation engine | Unit tests | Scoring, thresholds, edge cases, persistence |
| Utilities | Unit tests | JSON parsers, pagination, error hierarchy |

## Architecture Validation

```bash
# Backend
cd backend
npm run lint              # architecture checks (cycles, prisma leakage, enum hardcoding)

# Frontend
cd frontend
npm run architecture:check
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account |
| `POST` | `/api/v1/auth/login` | No | Login |
| `POST` | `/api/v1/auth/refresh` | No | Refresh tokens |
| `POST` | `/api/v1/auth/logout` | Yes | Logout |
| `GET` | `/api/v1/auth/me` | Yes | Current user |
| `GET` | `/health` | No | Liveness check |
| `GET` | `/ready` | No | Readiness check (DB + Redis state) |
| `GET` | `/api/v1/users/profile` | Yes | User profile |
| `PATCH` | `/api/v1/users/profile` | Yes | Update profile |
| `PUT` | `/api/v1/users/preferences` | Yes | Update preferences |
| `DELETE` | `/api/v1/users/account` | Yes | Delete account |
| `GET` | `/api/v1/meals` | Yes | List meals (paginated) |
| `POST` | `/api/v1/meals` | Yes | Create meal |
| `GET` | `/api/v1/meals/:id` | Yes | Get meal |
| `PATCH` | `/api/v1/meals/:id` | Yes | Update meal |
| `DELETE` | `/api/v1/meals/:id` | Yes | Delete meal |
| `GET` | `/api/v1/meals/search` | Yes | Search meals |
| `GET` | `/api/v1/habits` | Yes | List habits |
| `POST` | `/api/v1/habits` | Yes | Create habit |
| `PATCH` | `/api/v1/habits/:id` | Yes | Update habit |
| `DELETE` | `/api/v1/habits/:id` | Yes | Delete habit |
| `GET` | `/api/v1/meal-logs` | Yes | List meal logs (paginated) |
| `POST` | `/api/v1/meal-logs` | Yes | Create meal log |
| `GET` | `/api/v1/habit-logs` | Yes | List habit logs (paginated) |
| `POST` | `/api/v1/habit-logs` | Yes | Create habit log |
| `GET` | `/api/v1/recommendations` | Yes | List recommendations |
| `POST` | `/api/v1/recommendations/generate` | Yes | Generate AI recommendations |
| `PATCH` | `/api/v1/recommendations/:id/read` | Yes | Mark read |
| `PATCH` | `/api/v1/recommendations/:id/save` | Yes | Toggle save |

## Security

- JWT access + refresh token rotation with SHA-256 hashed storage
- bcrypt password hashing (configurable rounds via `BCRYPT_ROUNDS`)
- Helmet CSP headers in production
- Rate limiting (Redis-backed in production, in-memory fallback)
- Zod input validation on all endpoints
- Secure httpOnly cookies for refresh tokens
- Defensive Pagination: Strict maximum take caps enforced at the Repository layer to prevent OOM
- Request ID tracing on all responses

## Observability

- **Structured logging** via Pino (JSON in production, pretty in dev)
- **Request tracing** with `X-Request-ID` header propagation
- **Response timing** with high-resolution `process.hrtime` measurement
- **Startup validation** with connection checks and timing
- **Graceful shutdown** with configurable timeout and signal handlers

## Production Deployment (Cloud Run)

```bash
# Build and push
docker build -t nutrisense-backend ./backend
docker tag nutrisense-backend gcr.io/PROJECT/nutrisense-backend
docker push gcr.io/PROJECT/nutrisense-backend

# Deploy
gcloud run deploy nutrisense-api \
  --image gcr.io/PROJECT/nutrisense-backend \
  --platform managed \
  --port 8080 \
  --set-env-vars "NODE_ENV=production" \
  --min-instances 0 \
  --max-instances 10
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema (7 models, indexed)
│   └── seed.ts              # Demo data seeder
├── src/
│   ├── config/              # Environment, constants, nutrition, database, redis, swagger
│   ├── middleware/           # Auth, error handler, rate limiter, request logger
│   ├── modules/
│   │   ├── auth/            # routes → controller → service → repository
│   │   ├── users/           # routes → controller → service → repository
│   │   ├── meals/           # routes → controller → service → repository
│   │   ├── habits/          # routes → controller → service → repository
│   │   ├── logs/            # routes → controller → service → repository
│   │   └── recommendations/ # routes → controller → service → engine → repository
│   ├── types/               # Fastify type augmentation
│   ├── utils/               # Errors, JWT, password, pagination, JSON, response, logger
│   ├── __tests__/           # Vitest unit tests
│   ├── app.ts               # Fastify app builder
│   └── server.ts            # Entry point with startup validation
├── vitest.config.ts
├── scripts/
│   └── architecture-check.mjs # Enforces layering/circular dependency rules
├── Dockerfile               # Multi-stage production build
└── .env.example

frontend/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Login, register pages
│   ├── (dashboard)/         # Protected dashboard layout with ErrorBoundary
│   └── api/                 # Health check proxy
├── components/
│   ├── shared/              # Navbar, Sidebar, LoadingSpinner, SkeletonCard, ErrorBoundary, EmptyState
│   ├── providers/           # Auth, Query, Theme providers
│   ├── auth/                # Auth UI components
│   └── dashboard/           # Dashboard UI components
├── features/                # Feature modules (auth, meals, habits, recommendations)
├── shared/                  # Typed API client, response types
├── store/                   # Zustand stores (auth, UI)
├── hooks/                   # Custom React hooks
├── scripts/                 # Frontend architecture checks
└── config/                  # App configuration constants

.github/
└── workflows/
    └── ci.yml               # GitHub Actions: lint, typecheck, test, build
```

## License

Private
