container launch commands
```#bash
docker compose -f ./docker-compose.yml up -d
```

pnpm workspace workflow
```bash
pnpm install
pnpm backend:start:dev
pnpm frontend:start
```

Do not run `pnpm install` inside `apps/backend`.
