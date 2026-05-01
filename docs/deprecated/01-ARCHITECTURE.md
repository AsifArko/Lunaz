# Lunaz — Architecture and Monorepo Structure

## 1. Repository Layout

Monorepo root contains applications and shared packages. Recommended structure:

```
lunaz/
├── apps/
│   ├── web/                 # Customer-facing React app
│   ├── manage/              # Admin React app (CMS)
│   └── backend/             # Node.js API
├── packages/
│   ├── types/               # Shared TypeScript interfaces, enums, DTOs, API contracts
│   ├── ui/                  # Shared React components (Web + Manage)
│   ├── config/              # Shared config schemas and env validation (optional)
│   └── eslint-config/       # Shared ESLint (optional)
├── lunaz-doc/               # This documentation
├── docker-compose.yml
├── package.json             # Workspace root
└── tsconfig.base.json       # Base TypeScript config
```

- **apps/** — Deployable applications.
- **packages/** — Consumed by apps; no direct deployment. `types` is used by Backend, Web, and Manage; `ui` by Web and Manage only.

## 2. Package Dependency Graph

- **Backend** depends on: `@lunaz/types` (and optionally `@lunaz/config`).
- **Web** depends on: `@lunaz/types`, `@lunaz/ui`.
- **Manage** depends on: `@lunaz/types`, `@lunaz/ui`.

`packages/ui` may depend on `@lunaz/types` for prop types. No app should depend on another app.

## 3. System Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client layer                             │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │   Web (React)        │         │   Manage (React)     │        │
│  │   - Browsing         │         │   - Products CMS     │        │
│  │   - Cart / Checkout  │         │   - Orders           │        │
│  │   - Profile / Orders │         │   - Sales / Finance  │        │
│  └──────────┬──────────┘         └──────────┬──────────┘        │
│             │                                │                    │
│             │     Shared: @lunaz/types       │                    │
│             │     Shared: @lunaz/ui          │                    │
└─────────────┼────────────────────────────────┼────────────────────┘
              │                                │
              │         REST API               │
              └────────────────┬───────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                      Backend (Node.js)                            │
│  ┌───────────────────────────▼───────────────────────────┐       │
│  │  API layer (routes, auth middleware, validation)       │       │
│  └───────────────────────────┬───────────────────────────┘       │
│  ┌───────────────────────────▼───────────────────────────┐       │
│  │  Services (auth, products, orders, cart, users, etc.)  │       │
│  └───────────────────────────┬───────────────────────────┘       │
│  ┌───────────────────────────▼───────────────────────────┐       │
│  │  Data / Integrations (MongoDB, S3, payment provider)   │       │
│  └───────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
              │                                │
              ▼                                ▼
       ┌─────────────┐                 ┌─────────────┐
       │  MongoDB    │                 │  S3         │
       └─────────────┘                 └─────────────┘
```

## 4. Backend Module Boundaries

Backend should be split by domain (modular):

- **auth** — Registration, login, JWT, password reset, role checks.
- **users** — Profile, addresses, default address.
- **categories** — Category CRUD and listing.
- **products** — Product CRUD, listing, search; image upload/delete.
- **cart** — Cart get/update/merge (logged-in).
- **orders** — Order creation, listing, detail, status update.
- **transactions** — List transactions/payouts for Manage.
- **upload** — S3 presign or server-side upload; use by products.

Each module can expose: routes, service functions, and (if using Mongoose) schema. Shared types come from `@lunaz/types`.

## 5. Frontend Module Boundaries

- **Web** — Feature-based folders (e.g. `auth`, `products`, `cart`, `checkout`, `account`, `orders`) plus shared `components`, `hooks`, `api`.
- **Manage** — Similarly: `auth`, `products`, `categories`, `orders`, `customers`, `reports`, `settings`, plus shared `components`, `api`.

Shared `@lunaz/ui` holds presentational components (buttons, inputs, modals, cards, tables) and optionally layout primitives used by both apps.

## 6. Configuration and Environment

- All apps read configuration from environment variables.
- Optional: `packages/config` exports a validated config object (e.g. Zod) so each app validates env on startup and gets typed config.
- No secrets or environment-specific URLs in source; `.env.example` files document required variables per app.

## 7. API Contract

- Backend exposes REST endpoints; request/response bodies and path/query params align with types in `@lunaz/types`.
- API versioning: prefix routes with `/api/v1/` (or similar) for future compatibility.
- Web and Manage use the same base API URL (with different auth tokens and role restrictions).

See [02-BACKEND.md](./02-BACKEND.md) for route list and [06-SHARED-PACKAGES.md](./06-SHARED-PACKAGES.md) for type definitions.
