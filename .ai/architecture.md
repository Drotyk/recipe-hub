# Architecture

## High-level layout

```text
.
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

Backend follows a simple NestJS layered structure:

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

- `controllers/` expose HTTP endpoints and convert results to DTOs with `plainToInstance`.
- `business-logic/` contains services and authorization/business rules.
- `repositories/` contain TypeORM repositories.
- `domains/entities/` contain TypeORM entities.
- `domains/view-models/` contain DTOs for request/response models.
- `common/` contains guards, decorators, utilities, and interfaces.
- `modules/db.module.ts` wires TypeORM/database access.

Request flow:

```text
HTTP request
-> Controller
-> Service in business-logic
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
- Swagger is configured in `main.ts`.
- CORS is enabled globally with `app.enableCors()`.

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

## Authorization rules currently present

- Users can update/delete only their own account unless `isAdmin` is true.
- Recipes can be updated/deleted only by their author unless `isAdmin` is true.
- Recipe ingredients can be changed only by the owner of the recipe unless `isAdmin` is true.
- Comments can be deleted only by their author unless `isAdmin` is true.

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
- `api.ts` defines shared API types and fetch helpers.
- `auth.tsx` manages login/register/logout and token storage.
- `components/` contains reusable UI primitives.
- `pages/` contains route-level screens.

## Frontend auth flow

- `AuthProvider` reads `accessToken` from `localStorage`.
- JWT payload is decoded client-side for `sessionUser`.
- `apiFetch` adds `Authorization: Bearer <token>` when `accessToken` exists.
- Login/register call backend auth endpoints and store token pair.
- Logout clears `accessToken` and removes tokens from localStorage.

## Frontend public/private routing

Public route names in `App.tsx`:

- `auth`
- `about`
- `support`
- `recipes`
- `ingredients`

When there is no access token and route is private, the app navigates to `/auth`.
When there is an access token and route is `/auth`, the app navigates to `/dashboard`.

## Database architecture

- TypeORM config is in `apps/backend/ormconfig.ts`.
- Database migrations are in `apps/backend/type-orm/migrations`.
- TypeORM `synchronize` is disabled.
- Entity and migration paths adapt to TypeScript runtime or compiled JS runtime.
- PostgreSQL and pgAdmin are managed by `docker-compose.yml`.
