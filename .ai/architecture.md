# Architecture

## High-level layout

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── backend/
│   └── frontend/
├── scripts/
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

This is a pnpm workspace with separate backend and frontend apps.

## Backend architecture

Backend follows a NestJS layered structure with strict TypeScript:

```text
apps/backend/src/
├── app.module.ts
├── main.ts
├── business-logic/
├── common/
├── controllers/
├── domains/
│   ├── entities/
│   └── view-models/
├── modules/
└── repositories/
```

Responsibilities:

- `controllers/` expose HTTP endpoints, apply DTO validation, and convert results with `plainToInstance`.
- `business-logic/` contains services, unit tests (`*.spec.ts`), and authorization/ownership rules.
- `repositories/` contain TypeORM repositories.
- `domains/entities/` contain TypeORM entities.
- `domains/view-models/` contain DTOs and their validation tests.
- `common/` contains guards, decorators, utilities, cookies and passport strategies.
- `modules/db.module.ts` wires TypeORM/database access.

Request flow:

```text
HTTP request
-> Global JwtAuthGuard (APP_GUARD)
-> Controller
-> Service in business-logic (Ownership check)
-> Repository / TypeORM Entity
-> DTO response
```

## Backend cross-cutting behavior

- `JwtAuthGuard` is registered globally in `AppModule` through `APP_GUARD`.
- Endpoints are private by default.
- Use `@Public()` from `common/decorators` for endpoints that do not require auth.
- `ValidationPipe` is global and configured with:
  - `transform: true`
  - `whitelist: true`
  - `forbidUnknownValues: true`
  - `forbidNonWhitelisted: true`
- `cookieParser()` middleware is enabled for `HttpOnly` refresh token cookies.
- Swagger is configured in `main.ts`.
- CORS is restricted to `process.env.FRONTEND_URL` with `credentials: true`.

## Backend domain model

Core entities:

- `UserEntity`
  - fields: `name`, `email`, `password`, `bio`, `social`
  - relation: one user has many recipes
- `RecipeEntity`
  - fields: `name`, `text`, `authorId`
  - relations: author, recipe ingredients, comments
- `IngredientEntity`
  - field: `name`
  - relation: recipe ingredients
- `RecipeIngredientsEntity`
  - fields: `recipeId`, `ingredientId`, `amount`, `unit`
  - relations: recipe, ingredient
- `CommentEntity`
  - fields: `text`, `recipeId`, `authorId`
  - relations: recipe, author

All entities extend `AbstractEntity`, which provides:

- `id`
- `createdAt`
- `updatedAt`
- `deletedAt`

## Authorization & Ownership Enforcement

- Backend strictly ignores any client-supplied `authorId` in body DTOs; `authorId` is extracted directly from the verified JWT (`req.user.id`).
- Users can update/delete only their own account unless `isAdmin` is true.
- Recipes can be updated/deleted only by their author unless `isAdmin` is true.
- Recipe ingredients can be changed only by the owner of the recipe unless `isAdmin` is true.
- Comments can be deleted only by their author unless `isAdmin` is true.

## Auth Architecture & Token Management

1. **Access Tokens**: Short-lived JWTs stored strictly in-memory on the frontend.
2. **Refresh Tokens**: Stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`refreshToken`), preventing XSS access.
3. **Google OAuth 2.0 Flow**: Google callback generates a short-lived single-use code (`oauthCode`, TTL = 2 min) passed back via URL query, which the frontend immediately exchanges via `POST /auth/exchange` to receive tokens securely.

## API shape

Collections use this response format:

```ts
{
  items: T[];
  metadata: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}
```

Collection query fields include:

- `page`
- `perPage`
- `search`
- `recipeId`
- `ingredientId`

## Frontend architecture

Frontend follows a lightweight React structure:

```text
apps/frontend/src/
├── App.tsx
├── api.ts
├── auth.tsx
├── main.tsx
├── styles.css
├── app/
├── components/
└── pages/
```

Responsibilities:

- `main.tsx` mounts React and providers.
- `App.tsx` selects page by route and handles auth redirects/toasts.
- `app/routing.ts` parses `window.location.pathname` and performs navigation with `history.pushState`.
- `api.ts` defines shared API types and fetch helpers with `credentials: 'include'`.
- `auth.tsx` manages login/register/logout, OAuth exchange, and in-memory token state.
- `components/` contains reusable UI primitives.
- `pages/` contains route-level screens.

## Frontend auth flow

- `AuthProvider` keeps `accessToken` in React state (`useState`), never in `localStorage`.
- JWT payload is decoded client-side for `sessionUser`.
- `apiFetch` adds `Authorization: Bearer <token>` when `accessToken` exists and sets `credentials: 'include'` for cookie transmission.
- Refreshing tokens is done via `POST /auth/refresh`, reading the `HttpOnly` cookie automatically.
- Logout calls `POST /auth/logout` to clear server-side cookies and resets in-memory state.

## Database architecture

- TypeORM config is in `apps/backend/ormconfig.ts`.
- Database migrations are in `apps/backend/type-orm/migrations`.
- TypeORM `synchronize` is disabled.
- Entity and migration paths adapt to TypeScript runtime or compiled JS runtime.
- PostgreSQL and pgAdmin are managed by `docker-compose.yml`.
