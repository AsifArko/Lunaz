# Lunaz — Backend Specification

## 1. Stack and Structure

- **Runtime:** Node.js
- **Language:** TypeScript (strict)
- **Framework:** Express or Fastify
- **Database:** MongoDB (driver: native or Mongoose)
- **Storage:** AWS S3 (SDK v3)
- **Validation:** Zod (schemas can live in `@lunaz/types` or backend)
- **Auth:** JWT (access token; optional refresh token)

## 2. Project Structure (Backend)

```
apps/backend/
├── src/
│   ├── index.ts              # App entry, server start
│   ├── app.ts                # Express/Fastify app, middleware wiring
│   ├── config/
│   │   └── index.ts          # Load and validate env
│   ├── middleware/
│   │   ├── auth.ts           # JWT verify, attach user
│   │   ├── requireRole.ts   # customer | admin
│   │   ├── validate.ts      # Request validation (Zod)
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── users/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── transactions/
│   ├── lib/
│   │   ├── db.ts            # MongoDB connection
│   │   ├── s3.ts            # S3 client and helpers
│   │   └── jwt.ts
│   └── types/
│       └── express.d.ts     # Extend Request with user
├── package.json
└── tsconfig.json
```

## 3. Configuration (Environment Variables)

| Variable                | Description                     | Example                           |
| ----------------------- | ------------------------------- | --------------------------------- |
| `NODE_ENV`              | Environment                     | `development`, `production`       |
| `PORT`                  | Server port                     | `4000`                            |
| `MONGODB_URI`           | MongoDB connection string       | `mongodb://localhost:27017/lunaz` |
| `JWT_SECRET`            | Secret for signing JWT          | long random string                |
| `JWT_EXPIRES_IN`        | Access token TTL                | `7d`                              |
| `S3_BUCKET`             | Bucket for product images       | `lunaz-products`                  |
| `S3_REGION`             | AWS region                      | `us-east-1`                       |
| `AWS_ACCESS_KEY_ID`     | S3 access (or IAM role in prod) | —                                 |
| `AWS_SECRET_ACCESS_KEY` | S3 secret                       | —                                 |
| `S3_ENDPOINT`           | Optional; custom endpoint       | —                                 |
| `FRONTEND_WEB_URL`      | Web app URL (CORS, emails)      | `http://localhost:3000`           |
| `FRONTEND_MANAGE_URL`   | Manage app URL (CORS)           | `http://localhost:3001`           |
| `STRIPE_SECRET_KEY`     | Payment provider (optional)     | `sk_...`                          |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing (optional)      | `whsec_...`                       |

All config loaded in `config/index.ts` and validated on startup (e.g. Zod).

## 4. API Routes (REST)

Base prefix: `/api/v1`.

### 4.1 Auth (public)

| Method | Path                    | Description                                           |
| ------ | ----------------------- | ----------------------------------------------------- |
| POST   | `/auth/register`        | Register (email, password, name)                      |
| POST   | `/auth/login`           | Login; returns JWT and user summary                   |
| POST   | `/auth/forgot-password` | Request reset; send email/link (if email implemented) |
| POST   | `/auth/reset-password`  | Reset with token from email                           |
| GET    | `/auth/me`              | Current user (requires auth)                          |

### 4.2 Users (authenticated: customer or admin)

| Method | Path                              | Description          |
| ------ | --------------------------------- | -------------------- |
| GET    | `/users/me`                       | Profile              |
| PATCH  | `/users/me`                       | Update profile       |
| PUT    | `/users/me/password`              | Change password      |
| GET    | `/users/me/addresses`             | List addresses       |
| POST   | `/users/me/addresses`             | Add address          |
| PATCH  | `/users/me/addresses/:id`         | Update address       |
| DELETE | `/users/me/addresses/:id`         | Delete address       |
| PATCH  | `/users/me/addresses/:id/default` | Set default shipping |

### 4.3 Categories (public read; admin write)

| Method | Path              | Description                    |
| ------ | ----------------- | ------------------------------ |
| GET    | `/categories`     | List categories (tree or flat) |
| GET    | `/categories/:id` | Category by id/slug            |
| POST   | `/categories`     | Create (admin)                 |
| PATCH  | `/categories/:id` | Update (admin)                 |
| DELETE | `/categories/:id` | Delete (admin)                 |

### 4.4 Products (public read; admin write)

| Method | Path                            | Description                                              |
| ------ | ------------------------------- | -------------------------------------------------------- |
| GET    | `/products`                     | List; query: category, status, sort, page, limit, search |
| GET    | `/products/:id`                 | Product by id/slug (with variants, images)               |
| POST   | `/products`                     | Create (admin)                                           |
| PATCH  | `/products/:id`                 | Update (admin)                                           |
| DELETE | `/products/:id`                 | Delete (admin)                                           |
| POST   | `/products/:id/images`          | Upload image(s) to S3; store URLs (admin)                |
| DELETE | `/products/:id/images/:imageId` | Remove image (admin)                                     |

### 4.5 Cart (authenticated customer)

| Method | Path              | Description                                                |
| ------ | ----------------- | ---------------------------------------------------------- |
| GET    | `/cart`           | Get current cart                                           |
| PUT    | `/cart`           | Replace cart (array of { productId, variantId, quantity }) |
| POST   | `/cart/items`     | Add item                                                   |
| PATCH  | `/cart/items/:id` | Update quantity                                            |
| DELETE | `/cart/items/:id` | Remove line                                                |

### 4.6 Orders (customer: own; admin: all)

| Method | Path                 | Description                                           |
| ------ | -------------------- | ----------------------------------------------------- |
| POST   | `/orders`            | Create order from cart (customer)                     |
| GET    | `/orders`            | List orders (customer: own; admin: all, with filters) |
| GET    | `/orders/:id`        | Order detail                                          |
| PATCH  | `/orders/:id/status` | Update status (admin)                                 |

### 4.7 Transactions / Finance (admin)

| Method | Path             | Description                                       |
| ------ | ---------------- | ------------------------------------------------- |
| GET    | `/transactions`  | List transactions (query: dateFrom, dateTo, type) |
| GET    | `/payouts`       | List payouts / cash outs                          |
| GET    | `/reports/sales` | Aggregated sales (e.g. by day/week/month)         |

### 4.8 Health

| Method | Path      | Description                             |
| ------ | --------- | --------------------------------------- |
| GET    | `/health` | Health check (DB connectivity optional) |

## 5. Authentication and Authorisation

- **Registration:** Hash password (bcrypt); create user with role `customer`; return JWT.
- **Login:** Verify password; issue JWT containing `userId` and `role`.
- **Middleware:** `auth` — verify JWT, attach `req.user` (`id`, `email`, `role`). `requireRole(['admin'])` for Manage-only routes.
- **CORS:** Allow `FRONTEND_WEB_URL` and `FRONTEND_MANAGE_URL`; credentials if using cookies.

## 6. S3 Integration

- **Upload:** Option A — Backend generates presigned POST/PUT URL; frontend uploads directly. Option B — Frontend sends file to Backend; Backend uploads to S3. Store returned URL in product document.
- **Key pattern:** e.g. `products/{productId}/{uuid}.{ext}` to avoid collisions.
- **Delete:** On product delete or image remove, delete object from S3 by key.
- **Serving:** Images served via public URL or presigned GET; bucket policy as needed.

## 7. Error Handling and Validation

- **Validation:** Use Zod to parse body/query/params; on failure return 400 with clear messages.
- **Errors:** Central error handler; map to HTTP status (401, 403, 404, 409, 500); consistent JSON shape, e.g. `{ error: { code, message } }`.
- **Security:** Do not leak stack traces in production; log errors server-side.

## 8. Security

- **Rate limiting:** Apply to auth and public APIs (e.g. express-rate-limit).
- **Helmet:** Use Helmet for security headers.
- **Input sanitisation:** Validation and type checks; no raw injection into queries (use parameterised queries / ODM).

## 9. Dependencies (Typical)

- `express` or `fastify`
- `mongodb` or `mongoose`
- `@aws-sdk/client-s3`
- `jsonwebtoken`, `bcrypt`
- `zod`
- `cors`, `helmet`, `express-rate-limit`
- `dotenv` (or similar for env loading)

Types: consume `@lunaz/types` for request/response bodies and entities.
