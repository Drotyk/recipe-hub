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
- Language: TypeScript.
- Runtime tooling: Nest CLI, ts-node, ts-node-dev.
- API docs: Swagger at `/api-docs`.
- Auth: JWT with `@nestjs/jwt`, Passport, `passport-jwt`.
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
- API client: native `fetch` wrapper in `src/api.ts`.
- Auth state: React context in `src/auth.tsx`, tokens in `localStorage`.

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
pnpm backend:mi:show
pnpm backend:mi:run
pnpm backend:mi:revert
```

## Ports and URLs

- Backend API: `http://localhost:3000`.
- Swagger: `http://localhost:3000/api-docs`.
- Frontend dev server: usually `http://127.0.0.1:5173`.
- Frontend API base fallback: `http://127.0.0.1:3000`.

## Testing status

Automated tests are not configured yet.
The backend `test` script currently exits with `Error: no test specified`.
