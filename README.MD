<div align="center">
  <h1>Algoritm Lab</h1>
  <p>
    Сучасний веб-додаток, побудований з використанням <strong>NestJS</strong> та <strong>React</strong> у монорепозиторії (pnpm).
  </p>

  <!-- Баджі з технологіями -->
  <p>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />
    <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  </p>
</div>

<br />

## Про проєкт

**Algoritm Lab** — це лабораторне середовище та навчальний проєкт для розробки сучасних веб-рішень. 
Проєкт організовано як монорепозиторій за допомогою `pnpm workspace`, що поєднує бекенд на NestJS та фронтенд на React.

---

## Швидкий старт

### 1. Запуск інфраструктури (База даних)

Для локальної розробки використовується Docker. Запустіть контейнери з PostgreSQL та pgAdmin:

```bash
docker compose -f ./docker-compose.yml up -d
```

### 2. Встановлення залежностей та запуск

> [!WARNING]
> **Важливо:** Не запускайте `pnpm install` всередині папок додатків (наприклад, `apps/backend`). Всі залежності керуються виключно з кореня проєкту.

```bash
# Встановлення всіх залежностей
pnpm install

# Запуск бекенду (NestJS) у режимі розробки
pnpm backend:start:dev

# Запуск фронтенду (React + Vite)
pnpm frontend:start
```

---

## Структура проєкту

<details>
<summary><b>Натисніть, щоб розгорнути структуру файлів</b></summary>
<br>

```text
.
├── apps/
│   ├── backend/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── business-logic/  # Сервіси та бізнес-логіка
│   │   │   │   └── auth/        # Логіка авторизації та JWT
│   │   │   ├── common/          # Guards, decorators, utils, interfaces
│   │   │   ├── controllers/     # REST controllers
│   │   │   ├── domains/
│   │   │   │   ├── entities/    # TypeORM entities
│   │   │   │   └── view-models/ # DTO для API
│   │   │   ├── modules/         # Nest modules
│   │   │   ├── repositories/    # Робота з базою даних
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── type-orm/            # Міграції бази даних
│   └── frontend/                # React + Vite frontend
│       ├── src/
│       │   ├── app/             # Routing та спільні налаштування
│       │   ├── components/      # UI компоненти
│       │   ├── pages/           # Сторінки застосунку
│       │   ├── api.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── styles.css
│       └── index.html
├── scripts/
│   └── enforce-root-install.mjs # Перевірка встановлення залежностей з кореня
├── docker-compose.yml           # PostgreSQL / pgAdmin контейнери
└── pnpm-workspace.yaml          # Налаштування pnpm workspace
```

</details>

---
