# Entartes Web App

School management system for Ent'artes — a performing arts school.

## Stack

- **Backend**: Node.js + Express, running on port 3000
- **ORM**: Prisma with PostgreSQL (`DATABASE_URL` env var)
- **Auth**: JWT (Bearer tokens) + bcrypt password hashing
- **Docs**: Swagger UI at `/api-docs`
- **Frontend**: Plain React (no bundler config found at root)

## Project Structure

```
backend/
  server.js               # Express app entry point, route registration
  prisma/schema.prisma    # Database schema (source of truth)
  src/
    routes/               # Route definitions with Swagger JSDoc annotations
    controllers/          # Request handling — thin, delegates to services
    services/             # Business logic — all DB access via Prisma here
    middlewares/          # Auth middleware (JWT verification)
  generated/              # Prisma generated client (do not edit)

frontend/
  src/
    views/                # Page-level React components
    components/           # Reusable UI components
    services/             # API call helpers
```

## Key Domain Models (from Prisma schema)

| Model | Description |
|---|---|
| `utilizador` | Base user (all roles) |
| `aluno` | Student (extends utilizador) |
| `docente` | Teacher (extends utilizador) |
| `coordenadora` | Coordinator (extends utilizador) |
| `grupo` | Class group |
| `marcacao` | Booking/session |
| `disponibilidade` | Teacher availability slots |
| `horario_letivo` | Teaching schedule |
| `evento` | School event |
| `modalidade` | Activity type (dance style, etc.) |
| `sala` | Room |
| `notificacao` | User notification |

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start with nodemon (hot reload)
npm start            # Production start
npm run db:sync      # Pull DB schema + regenerate Prisma client

# Prisma
npx prisma studio    # Visual DB browser
npx prisma generate  # Regenerate client after schema changes
npx prisma db pull   # Sync schema from existing DB
```

## Conventions

- **Routes** live in `src/routes/` with Swagger JSDoc comments on each endpoint.
- **Controllers** are thin — they parse req/res, call a service, return JSON.
- **Services** contain all business logic and Prisma queries. Import `PrismaClient` there.
- **Middleware** in `src/middlewares/` — auth checks go here, not in controllers.
- Model/table names use Portuguese (`utilizador`, `marcacao`, `disponibilidade`, etc.) — keep that naming consistent.
- Use `@prisma/client` (in devDependencies) for the generated client.

## API Routes

| Prefix | Module |
|---|---|
| `/api/auth` | Login / JWT |
| `/api/users` | User CRUD |
| `/api/event` | Events |
| `/api/coaching` | Coaching sessions |
| `/api/relatorio` | Reports |

## Environment Variables

```
DATABASE_URL=postgresql://...
PORT=3000             # Optional, defaults to 3000
JWT_SECRET=...
```

## Schema Changes Workflow

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (or migration) to apply to DB
3. Run `npx prisma generate` to update the client
4. Update relevant services to use new fields/models
