# Conventions

## General

- Keep changes small and aligned with the existing project structure.
- Prefer existing local patterns over adding new abstractions.
- Do not reformat unrelated files.
- Do not include generated/runtime folders in docs or context:
  - `node_modules`
  - `dist`
  - `.git`
  - `.idea`
  - `postgres-data`
  - `pgadmin-data`
- Run commands from the repository root unless a package script explicitly requires another cwd.
- Do not run `pnpm install` inside `apps/backend` or `apps/frontend`.

## Package management

- Use pnpm workspace scripts from root.
- Add dependencies only when necessary and to the correct workspace package.
- Prefer root scripts such as:
  - `pnpm backend:start:dev`
  - `pnpm frontend:start`
  - `pnpm backend:build`
  - `pnpm frontend:build`
  - `pnpm backend:test`
  - `pnpm backend:lint`
  - `pnpm backend:lint:fix`
  - `pnpm frontend:lint`

## Backend code style

- Keep NestJS layering:
  - controller handles HTTP shape and validation;
  - service handles business rules and ownership checks;
  - repository handles database access;
  - DTOs describe request/response models (never expose `authorId` input in mutation DTOs);
  - entities describe database schema.
- Follow strict TypeScript mode (`strictNullChecks`, `noImplicitAny`).
- Use existing `@/src/...` path alias imports in backend files.
- Return DTOs from controllers with `plainToInstance` when matching existing controller style.
- Use Nest exceptions such as `BadRequestException`, `ForbiddenException`, `NotFoundException`, `UnauthorizedException`, `ConflictException`.
- Keep collection responses as `{ items, metadata }`.
- Preserve global auth behavior:
  - endpoints are private by default (`APP_GUARD`);
  - add `@Public()` only when endpoint should be available without JWT.
- When adding fields to entities, update:
  - entity;
  - DTOs;
  - migrations;
  - frontend API types if exposed to UI.

## Database conventions

- Do not enable TypeORM `synchronize`.
- Use migrations for schema changes (`pnpm backend:mi:run`, `pnpm backend:mi:show`).
- Existing database naming uses snake_case through `SnakeNamingStrategy`.
- Existing soft-delete pattern uses `DeleteDateColumn` and `softDelete` for most main entities.
- Check whether a service returns an entity after deletion; avoid returning `null` accidentally after `softDelete`.

## Frontend code style

- Use existing React components from `apps/frontend/src/components` before creating new primitives.
- Keep route definitions in `apps/frontend/src/app/routing.ts`.
- Keep API functions and shared API types in `apps/frontend/src/api.ts`.
- Keep auth logic in `apps/frontend/src/auth.tsx`.
- Keep route-level screens in `apps/frontend/src/pages`.
- Always set `credentials: 'include'` on API calls to allow `HttpOnly` cookies to be sent.
- Never store tokens in `localStorage` or `sessionStorage`. Keep access tokens in React state.
- If backend response shape changes, update frontend API types and all affected pages.
- Use `onMessage(type, text)` pattern for user-visible errors/success messages where existing pages do so.
- Avoid adding a routing library unless explicitly requested.

## Security & Auth conventions

- Backend JWT payload contains `id`, `email`, `isAdmin`.
- Backend strictly derives user ID from `req.user.id` and verifies entity ownership before update/delete actions.
- Access token is held in-memory; Refresh token is sent via `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- Single-use code exchange (`oauthCode`) is used for Google OAuth redirects.

## Verification

For backend changes:

```bash
pnpm backend:test
pnpm backend:build
pnpm backend:lint
```

For frontend changes:

```bash
pnpm frontend:lint
pnpm frontend:build
```

For DB changes, inspect migrations:

```bash
pnpm backend:mi:show
```

Automated unit tests (`pnpm backend:test`) and linting scripts MUST pass prior to completing tasks.
