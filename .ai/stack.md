# Stack

## Workspace

- Package manager: `pnpm@11.3.0`.
- Repo type: monorepo / pnpm workspace.
- Workspace config: `pnpm-workspace.yaml`.
- Root package: `package.json`.
- Install dependencies only from repository root.

## Backend

- Location: `apps/backend`.
- Framework: NestJS 11.
- Language: TypeScript (Strict mode: `strictNullChecks`, `noImplicitAny`, etc.).
- Runtime tooling: Nest CLI, ts-node, ts-node-dev.
- API docs: Swagger at `/api-docs`.
- Auth: JWT (`@nestjs/jwt`, Passport, `passport-jwt`) with in-memory access tokens and `HttpOnly` refresh cookies.
- OAuth: Google OAuth 2.0 with single-use authorization code exchange (`POST /auth/exchange`).
- Cookie handling: `cookie-parser`.
- Validation/serialization: `class-validator`, `class-transformer`.
- Password hashing: `bcrypt`.
- Database ORM: TypeORM 0.3.
- Database driver: `pg`.
- Naming strategy: `typeorm-naming-strategies` `SnakeNamingStrategy`.
- Env loading: `dotenv` and local `loadEnv` utility.

Important backend packages:

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `@nestjs/typeorm`
- `@nestjs/swagger`
- `@nestjs/jwt`
- `@nestjs/passport`
- `cookie-parser`
- `typeorm`
- `pg`
- `bcrypt`
- `class-validator`
- `class-transformer`

## Frontend

- Location: `apps/frontend`.
- Framework/library: React 19.
- Build tool/dev server: Vite 7.
- Language: TypeScript.
- Routing: custom browser history router in `src/app/routing.ts`.
- API client: native `fetch` wrapper in `src/api.ts` (`credentials: 'include'`).
- Auth state: React context in `src/auth.tsx`, access token in-memory, refresh token in `HttpOnly` cookie.

Important frontend packages:

- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`
- `typescript`

## Database and infrastructure

- Database: PostgreSQL 17 in Docker.
- Admin UI: pgAdmin in Docker.
- Compose file: `docker-compose.yml`.
- Env example: `.env.example`.

Docker services:

- `db`
- `pgadmin`

## Root scripts

```bash
pnpm install
pnpm docker:up
pnpm docker:down
pnpm backend:start:dev
pnpm frontend:start
pnpm backend:build
pnpm frontend:build
pnpm backend:lint
pnpm backend:lint:fix
pnpm backend:test
pnpm frontend:lint
pnpm backend:mi:show
pnpm backend:mi:run
pnpm backend:mi:revert
```

## Ports and URLs

- Backend API: `http://localhost:3000` (or `process.env.PORT`).
- Swagger: `http://localhost:3000/api-docs`.
- Frontend dev server: usually `http://127.0.0.1:5173`.
- Frontend API base fallback: `http://127.0.0.1:3000`.

## Testing status & CI

- Unit tests: 43+ tests in backend covering Auth, Recipe, Comment services and DTO validation (`pnpm backend:test`).
- CI/CD: Automated GitHub Actions pipeline (`.github/workflows/ci.yml`) testing and building both apps on push/PR.
