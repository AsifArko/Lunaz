# Lunaz

Lifestyle and home décor e-commerce — Web (customer storefront + admin at /manage) and Backend (Node.js API). Monorepo with shared TypeScript types and React UI.

## Structure

- **apps/web** — Customer-facing React app + Admin dashboard at /manage (Vite + React + TypeScript). UI components live in `apps/web/src/ui`.
- **apps/backend** — Node.js API (Express + MongoDB)
- **types/** — Shared types, enums, API contracts (plain folder, imported via path aliases)
- **config/** — Env validation (plain folder, uses zod from backend)
- **lunaz-doc** — Specification and architecture docs

## Prerequisites

- Node.js 20+
- MongoDB (local or URI in env)

## Running locally (deploy / testing)

- **Full stack in one command:** `docker compose up --build` then `make docker-seed-admin`. See [docs/LOCAL-DEPLOYMENT.md](docs/LOCAL-DEPLOYMENT.md).
- **DB in Docker, apps with npm:** `make docker-up-db`, then run `npm run dev:backend` and `npm run dev:web` (manage at http://localhost:3000/manage).

## Quick start (local)

1. Copy env and set MongoDB:

   ```bash
   cp .env.example .env
   # Edit .env: set MONGODB_URI, JWT_SECRET
   ```

2. Install and build:

   ```bash
   npm install
   npm install
   npm run build
   ```

3. Run backend (needs MongoDB):

   ```bash
   npm run dev:backend
   ```

4. Create an admin user for the Manage app:

   ```bash
   # With default credentials (admin@lunaz.local / Admin123!)
   MONGODB_URI=mongodb://localhost:27017/lunaz npm run seed:admin

   # Or with custom credentials
   MONGODB_URI=mongodb://localhost:27017/lunaz \
   ADMIN_EMAIL=admin@example.com \
   ADMIN_PASSWORD=YourSecurePassword \
   ADMIN_NAME="Admin User" \
   npm run seed:admin
   ```

5. In another terminal, run Web (includes admin at /manage):

   ```bash
   npm run dev:web    # http://localhost:3000 (manage at /manage)
   ```

- Backend: http://localhost:4000
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/health

## Docker

```bash
docker compose up --build
```

- Backend: http://localhost:4000
- Web: http://localhost:3000 (manage at /manage)
- MongoDB: localhost:27017

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run build`       | Build all workspaces                     |
| `npm run dev:backend` | Start backend dev server                 |
| `npm run dev:web`     | Start Web dev server                     |
| `npm run seed:admin`  | Create admin user (requires MONGODB_URI) |

## Admin Access

The admin dashboard at `/manage` is for administrators only. Admin users are created via the seed script, not through public registration.

**Default admin credentials** (when using `npm run seed:admin`):

- Email: `admin@lunaz.local`
- Password: `Admin123!`

To create an admin with custom credentials:

```bash
MONGODB_URI=mongodb://localhost:27017/lunaz \
ADMIN_EMAIL=your@email.com \
ADMIN_PASSWORD=YourPassword123 \
npm run seed:admin
```

For Docker:

```bash
make docker-seed-admin
# or
docker compose exec backend npm run seed:admin
```

## Documentation

See **lunaz-doc/** for full specification, architecture, API, database schema, and feature matrix.
