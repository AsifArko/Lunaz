# Lunaz — Shared Packages Specification

## 1. Purpose

- **Strict typing** across Web, Manage, and Backend.
- **Single source of truth** for API contracts, entities, and enums.
- **Reusable UI** between Web and Manage for consistency and less duplication.

## 2. Package: `@lunaz/types`

### 2.1 Contents

- **Entities / domain models:** `User`, `Product`, `Category`, `Order`, `OrderItem`, `Cart`, `CartItem`, `Address`, `Transaction`, `Payout`, etc. Align with [03-DATABASE.md](./03-DATABASE.md).
- **Enums:** `UserRole`, `OrderStatus`, `ProductStatus`, `PaymentStatus`, `TransactionType`, etc.
- **API contracts:** Request/response body types for each endpoint, e.g.:
  - `RegisterRequest`, `LoginRequest`, `LoginResponse`
  - `CreateProductRequest`, `UpdateProductRequest`, `ProductResponse`
  - `CreateOrderRequest`, `OrderResponse`, `OrderListResponse`
  - `PaginatedResponse<T>`, `ListQueryParams`
- **Utility types:** `Id` (ObjectId as string in API), `Timestamp`, etc.

### 2.2 Structure

```
packages/types/
├── src/
│   ├── index.ts           # Re-exports
│   ├── user.ts
│   ├── product.ts
│   ├── category.ts
│   ├── order.ts
│   ├── cart.ts
│   ├── transaction.ts
│   ├── api/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   └── common.ts      # Pagination, errors
│   └── enums.ts
├── package.json
└── tsconfig.json
```

### 2.3 Usage

- **Backend:** Import for route handlers, service in/out, and (if using Zod) extend or derive schemas from types.
- **Web / Manage:** Import for API client functions, state shapes, and form types. Ensure API responses are typed with these interfaces.

### 2.4 Versioning

- Publish or link via workspace; any breaking change to a shared type should be coordinated (Backend and both frontends updated).

---

## 3. Package: `@lunaz/ui`

### 3.1 Purpose

Shared React components used by **Web** and **Manage** to keep UI consistent and reduce duplication.

### 3.2 Contents (suggested)

- **Primitives:** `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Label`, `Textarea`, `Badge`, `Spinner`.
- **Layout:** `Card`, `Container`, `Stack`, `Grid`, `Divider`, `PageHeader`.
- **Feedback:** `Alert`, `Modal`, `Toast` (or use a small toast provider), `Skeleton`.
- **Data display:** `Table`, `Pagination`, `EmptyState`, `Price` (formatted currency).
- **Navigation:** `Link`, `Tabs`, `Breadcrumb` (if same design in both apps).

Components should accept props typed with TypeScript; use `@lunaz/types` where relevant (e.g. `Price` uses currency/amount types).

### 3.3 Structure

```
packages/ui/
├── src/
│   ├── index.ts           # Re-exports
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── Input/
│   ├── Card/
│   ├── Table/
│   ├── Modal/
│   ├── Price/
│   └── theme/
│       ├── colors.ts
│       ├── spacing.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 3.4 Theming

- **Theme:** Shared tokens (colors, spacing, typography, radii) in `theme/`; components consume theme (e.g. via CSS variables or a theme context) so Web and Manage can each override with brand-specific values if needed.
- **Styling:** Use one approach across the package (e.g. Tailwind, styled-components, or CSS modules) and document it; both apps must use the same approach for `@lunaz/ui`.

### 3.5 Dependencies

- `react`, `react-dom` as peer dependencies.
- `@lunaz/types` for any shared types used in props (e.g. `Price`).

### 3.6 What stays app-specific

- **Web:** Product cards, category nav, checkout steps, order status badge (can use `@lunaz/ui` primitives but implement in Web).
- **Manage:** Product form, order detail layout, dashboard widgets (compose from `@lunaz/ui`; logic and layout in Manage).

---

## 4. Optional: `@lunaz/config`

- **Purpose:** Validate environment variables and expose a typed config object.
- **Contents:** Zod schemas for each app’s env (e.g. `backendEnvSchema`, `webEnvSchema`); export typed config after parsing.
- **Usage:** Each app (Backend, Web, Manage) imports and runs validation on startup; fail fast if required env is missing.

---

## 5. Build and Workspace

- Use a monorepo tool (npm workspaces, pnpm, Yarn workspaces) so that `apps/*` depend on `packages/*` via workspace protocol (e.g. `"@lunaz/types": "workspace:*"`).
- `packages/types` and `packages/ui` should have a build step (e.g. `tsc` or tsc + bundler) if they are published or consumed as built output; otherwise consume source with TypeScript project references.
- All packages use strict TypeScript and share a base `tsconfig` from root.

---

## 6. Summary

| Package                    | Consumed by          | Main contents                               |
| -------------------------- | -------------------- | ------------------------------------------- |
| `@lunaz/types`             | Backend, Web, Manage | Entities, enums, API request/response types |
| `@lunaz/ui`                | Web, Manage          | Reusable React components and theme tokens  |
| `@lunaz/config` (optional) | Backend, Web, Manage | Env validation and typed config             |

Keeping interfaces in `@lunaz/types` and shared UI in `@lunaz/ui` ensures the whole project stays strictly typed and consistent across the two React applications and the Backend.
