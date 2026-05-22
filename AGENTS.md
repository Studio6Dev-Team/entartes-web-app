# AGENTS.md

## Dev Commands

```bash
# Backend (port 3000)
cd backend && npm run dev
npm test                    # Jest
npx prisma db pull         # Sync schema from live DB
npx prisma generate       # Regenerate client
npx prisma studio        # GUI DB editor

# Frontend (port 5173)
cd frontend && npm run dev
npm run test              # Vitest
```

Both servers must run simultaneously—frontend proxies `/api` to `http://localhost:3000` (vite.config.js).

## Testing

- **Backend tests:** `backend/src/__tests__/**/*.test.js` (Jest)
- **Frontend tests:** `npm run test` (Vitest, runs `vitest run`)
- Coverage threshold: 70% (configured in backend/package.json)

## Prisma Workflow

Never edit schema.prisma manually. After schema changes:
1. `npx prisma db pull` — pull from live NeonDB
2. `npx prisma generate` — regenerate client

## Auth & Roles

- JWT: 8h expiration, stored in localStorage
- Roles (id_tipo): `1 = Coordenadora`, `2 = Docente`, `3 = Aluno`
- ProtectedRoute validates expiry before rendering

## Dev Accounts

| Role | Username | Password |
|------|----------|----------|
| Coordenadora | admin | admin |
| Docente | docente | docente |
| Aluno | aluno | aluno |

## API Proxy

Frontend uses `services/api.js` as single HTTP client—attaches Bearer token, auto-redirects on 401.