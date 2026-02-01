# Lunaz

Lifestyle and home décor e-commerce — Web (customer storefront), Manage (admin CMS), and Backend (Node.js API). Monorepo with shared TypeScript types and React UI.

## Structure

- **apps/web** — Customer-facing React app (Vite + React + TypeScript)
- **apps/manage** — Admin React app (Vite + React + TypeScript)
- **apps/backend** — Node.js API (Express + MongoDB)
- **packages/types** — Shared types, enums, API contracts (`@lunaz/types`)
- **packages/ui** — Shared React components (`@lunaz/ui`)
- **packages/config** — Env validation (`@lunaz/config`)
- **lunaz-doc** — Specification and architecture docs

## Prerequisites

- Node.js 20+
- MongoDB (local or URI in env)

## Quick start (local)

1. Copy env and set MongoDB:

   ```bash
   cp .env.example .env
   # Edit .env: set MONGODB_URI, JWT_SECRET
   ```

2. Install and build:

   ```bash
   npm install
   npm run build --workspace=@lunaz/types
   npm run build --workspace=@lunaz/config
   npm run build --workspace=@lunaz/ui
   npm run build --workspace=backend
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

5. In other terminals, run Web and Manage:

   ```bash
   npm run dev:web    # http://localhost:3000
   npm run dev:manage # http://localhost:3001
   ```

- Backend: http://localhost:4000
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/health

## Docker

```bash
docker compose up --build
```

- Backend: http://localhost:4000
- Web: http://localhost:3000
- Manage: http://localhost:3001
- MongoDB: localhost:27017

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run build`       | Build all workspaces                     |
| `npm run dev:backend` | Start backend dev server                 |
| `npm run dev:web`     | Start Web dev server                     |
| `npm run dev:manage`  | Start Manage dev server                  |
| `npm run seed:admin`  | Create admin user (requires MONGODB_URI) |

## Admin Access

The Manage app (`/manage`) is for administrators only. Admin users are created via the seed script, not through public registration.

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
