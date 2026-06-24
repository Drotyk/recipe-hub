# AI context

Цей файл дає короткий контекст для AI-асистента перед роботою з проєктом.
Детальніше дивись у сусідніх файлах:

- `.ai/stack.md` - стек, залежності, команди запуску.
- `.ai/architecture.md` - структура backend/frontend і основні потоки.
- `.ai/conventions.md` - правила редагування коду в цьому репозиторії.

## Опис проєкту

`algoritm-lab` - pnpm workspace з двома застосунками:

- `apps/backend` - NestJS API для рецептів, інгредієнтів, користувачів, коментарів, авторизації та зв'язків recipe-ingredient.
- `apps/frontend` - React + Vite інтерфейс для перегляду/створення/редагування рецептів, інгредієнтів, профілю, користувачів, сторінок інформації та підтримки.

Домен проєкту: кулінарний застосунок з рецептами. Основні сутності:

- `UserEntity` - користувачі з `name`, `email`, `password`, `bio`, `social`.
- `RecipeEntity` - рецепти з `name`, `text`, `authorId`.
- `IngredientEntity` - інгредієнти.
- `RecipeIngredientsEntity` - зв'язок рецепта з інгредієнтом, `amount`, `unit`.
- `CommentEntity` - коментарі до рецептів від користувачів.

## Як запускати

Команди виконувати з кореня репозиторію.

```bash
pnpm install
pnpm docker:up
pnpm backend:start:dev
pnpm frontend:start
```

Backend слухає `http://localhost:3000`.
Swagger доступний на `http://localhost:3000/api-docs`.
Frontend за замовчуванням працює на Vite dev server, зазвичай `http://127.0.0.1:5173`.

Не запускати `pnpm install` всередині `apps/backend` або `apps/frontend`.
У root `package.json` є `preinstall`, який перевіряє встановлення залежностей з кореня.

## Важливі команди

```bash
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

Тестів наразі фактично немає: backend `test` script завершується з помилкою `Error: no test specified`.

## Backend коротко

Backend побудований на NestJS:

- entrypoint: `apps/backend/src/main.ts`;
- root module: `apps/backend/src/app.module.ts`;
- controllers: `apps/backend/src/controllers`;
- services/business logic: `apps/backend/src/business-logic`;
- repositories: `apps/backend/src/repositories`;
- entities: `apps/backend/src/domains/entities`;
- DTO/view models: `apps/backend/src/domains/view-models`;
- DB module: `apps/backend/src/modules/db.module.ts`;
- TypeORM config: `apps/backend/ormconfig.ts`;
- migrations: `apps/backend/type-orm/migrations`.

Глобально підключені:

- `JwtAuthGuard` через `APP_GUARD`; endpoints приватні за замовчуванням.
- `@Public()` для публічних endpoints.
- `ValidationPipe` з `transform`, `whitelist`, `forbidUnknownValues`, `forbidNonWhitelisted`.
- Swagger з Bearer auth.

Основні API routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /recipe/collection`
- `GET /recipe/:id`
- `POST /recipe`
- `PATCH /recipe/:id`
- `DELETE /recipe/:id`
- `GET /ingredient/collection`
- `GET /ingredient/:id`
- `POST /ingredient`
- `PATCH /ingredient/:id`
- `DELETE /ingredient/:id`
- `GET /user/collection`
- `GET /user/:id`
- `POST /user`
- `PATCH /user/:id`
- `DELETE /user/:id`
- `GET /recipeIngredient/collection`
- `GET /recipeIngredient/:id`
- `POST /recipeIngredient`
- `PATCH /recipeIngredient/:id`
- `DELETE /recipeIngredient/:id`
- `GET /recipe/:recipeId/comments`
- `GET /user/:userId/comments`
- `POST /recipe/:recipeId/comments`
- `DELETE /comment/:id`

Публічні collection endpoints зараз є для рецептів та інгредієнтів.

## Frontend коротко

Frontend побудований на React + Vite без окремої routing-бібліотеки:

- entrypoint: `apps/frontend/src/main.tsx`;
- root component: `apps/frontend/src/App.tsx`;
- custom routing: `apps/frontend/src/app/routing.ts`;
- API client/types: `apps/frontend/src/api.ts`;
- auth context: `apps/frontend/src/auth.tsx`;
- reusable UI: `apps/frontend/src/components`;
- pages: `apps/frontend/src/pages`.

`apiFetch` бере base URL з `VITE_API_BASE`, fallback - `http://127.0.0.1:3000`.
Access token зберігається в `localStorage` як `accessToken`, refresh token - як `refreshToken`.

Основні frontend routes:

- `/auth`
- `/dashboard`
- `/recipes`
- `/recipes/new`
- `/recipes/:id`
- `/recipes/:id/edit`
- `/recipes/:id/ingredients`
- `/ingredients`
- `/ingredients/:id`
- `/users`
- `/users/:id`
- `/profile`
- `/about`
- `/support`
- `/settings`
- `/notifications`

## База даних і env

Docker compose піднімає:

- PostgreSQL `postgres:17`;
- pgAdmin `dpage/pgadmin4`.

Змінні середовища описані в `.env.example`.
TypeORM:

- `synchronize: false`;
- `logging: true`;
- `SnakeNamingStrategy`;
- міграції лежать у `apps/backend/type-orm/migrations`.

## Що важливо при змінах

- Якщо змінюється backend DTO/entity/route, перевірити `apps/frontend/src/api.ts` і відповідні pages.
- Якщо додається приватний endpoint, пам'ятати про глобальний JWT guard.
- Якщо endpoint має бути відкритим без токена, додати `@Public()`.
- Якщо змінюється схема БД, додати або оновити TypeORM migration.
- Якщо змінюється колекція, зберігати формат `{ items, metadata }`.
- Не включати в документацію або AI-контекст службові папки `node_modules`, `dist`, `.git`, `.idea`, `postgres-data`, `pgadmin-data`.
