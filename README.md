# Lunaz

Lunaz is a full-stack lifestyle and home decor e-commerce platform with:

- A public storefront for browsing and purchasing
- A secured admin workspace at `/manage`
- A modular backend API for commerce, analytics, settings, and compliance
- Monorepo-based development with shared TypeScript contracts

Built for production workflows with Docker, CI/CD pipelines, and environment-driven deployments.

---

## Table of Contents

- [Overview](#overview)
- [Preview Gallery](#preview-gallery)
- [Architecture](#architecture)
- [Feature Map](#feature-map)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Local Development](#local-development)
- [Docker Workflows](#docker-workflows)
- [Configuration](#configuration)
- [Scripts and Commands](#scripts-and-commands)
- [API Surface](#api-surface)
- [Data and Integrations](#data-and-integrations)
- [Quality and CI/CD](#quality-and-cicd)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Lunaz combines storefront and business operations in one cohesive platform:

- **Storefront**: catalog discovery, search, cart, checkout, account, and order history
- **Manage app** (`/manage`): products, categories, orders, customers, transactions, reports, analytics, compliance, and settings
- **Backend API**: Express + TypeScript modules with validation, auth middleware, rate limits, and MongoDB persistence

The codebase is organized as npm workspaces under a single repository so frontend and backend can evolve together with shared interfaces and deployment conventions.

---

## Preview Gallery

All thumbnails below are clickable. Clicking any image opens the full-size screenshot from `screenshots/`.

### Storefront

<p>
  <a href="screenshots/1%20-%20home.png"><img src="screenshots/1%20-%20home.png" alt="Home" width="240" /></a>
  <a href="screenshots/2%20-%20categories.png"><img src="screenshots/2%20-%20categories.png" alt="Categories" width="240" /></a>
  <a href="screenshots/3%20-%20products.png"><img src="screenshots/3%20-%20products.png" alt="Products" width="240" /></a>
  <a href="screenshots/4%20-%20account.png"><img src="screenshots/4%20-%20account.png" alt="Account" width="240" /></a>
  <a href="screenshots/5%20-%20addresses.png"><img src="screenshots/5%20-%20addresses.png" alt="Addresses" width="240" /></a>
  <a href="screenshots/6%20-%20order%20history.png"><img src="screenshots/6%20-%20order%20history.png" alt="Order History" width="240" /></a>
  <a href="screenshots/7%20-%20cart.png"><img src="screenshots/7%20-%20cart.png" alt="Cart" width="240" /></a>
  <a href="screenshots/8%20-%20checkout%20confirmation.png"><img src="screenshots/8%20-%20checkout%20confirmation.png" alt="Checkout Confirmation" width="240" /></a>
</p>

### Checkout and Payments

<p>
  <a href="screenshots/9%20-%20sslcommerce%20redirect.png"><img src="screenshots/9%20-%20sslcommerce%20redirect.png" alt="SSLCommerz Redirect" width="240" /></a>
  <a href="screenshots/10%20-%20payment%20enabled%20on%20card%20details.png"><img src="screenshots/10%20-%20payment%20enabled%20on%20card%20details.png" alt="Payment Enabled on Card Details" width="240" /></a>
  <a href="screenshots/11%20-%20otp%20redirect%20after%20pay.png"><img src="screenshots/11%20-%20otp%20redirect%20after%20pay.png" alt="OTP Redirect" width="240" /></a>
  <a href="screenshots/12%20-%20payment%20confirmation.png"><img src="screenshots/12%20-%20payment%20confirmation.png" alt="Payment Confirmation" width="240" /></a>
</p>

### Admin and Operations

<p>
  <a href="screenshots/13%20-%20Admin%20Dashboard.png"><img src="screenshots/13%20-%20Admin%20Dashboard.png" alt="Admin Dashboard" width="240" /></a>
  <a href="screenshots/14%20-%20Product%20List.png"><img src="screenshots/14%20-%20Product%20List.png" alt="Product List" width="240" /></a>
  <a href="screenshots/15%20-%20Create%20Product.png"><img src="screenshots/15%20-%20Create%20Product.png" alt="Create Product" width="240" /></a>
  <a href="screenshots/16%20-%20Category%20List.png"><img src="screenshots/16%20-%20Category%20List.png" alt="Category List" width="240" /></a>
  <a href="screenshots/17%20-%20Create%20Category.png"><img src="screenshots/17%20-%20Create%20Category.png" alt="Create Category" width="240" /></a>
  <a href="screenshots/18%20-%20Order%20list.png"><img src="screenshots/18%20-%20Order%20list.png" alt="Order List" width="240" /></a>
  <a href="screenshots/19%20-%20Customers%20List.png"><img src="screenshots/19%20-%20Customers%20List.png" alt="Customers List" width="240" /></a>
  <a href="screenshots/20%20-%20Transactions.png"><img src="screenshots/20%20-%20Transactions.png" alt="Transactions" width="240" /></a>
  <a href="screenshots/21%20-%20Reports%20%28Sales%20Analytics%29.png"><img src="screenshots/21%20-%20Reports%20%28Sales%20Analytics%29.png" alt="Sales Analytics Reports" width="240" /></a>
  <a href="screenshots/22%20-%20Business%20Compliance.png"><img src="screenshots/22%20-%20Business%20Compliance.png" alt="Business Compliance" width="240" /></a>
  <a href="screenshots/23%20-%20Income%20Tax%20Module.png"><img src="screenshots/23%20-%20Income%20Tax%20Module.png" alt="Income Tax Module" width="240" /></a>
  <a href="screenshots/24%20-%20Business%20Authenticity%20Page.png"><img src="screenshots/24%20-%20Business%20Authenticity%20Page.png" alt="Business Authenticity" width="240" /></a>
  <a href="screenshots/25%20-%20Licence%20and%20Certification.png"><img src="screenshots/25%20-%20Licence%20and%20Certification.png" alt="Licence and Certification" width="240" /></a>
  <a href="screenshots/26%20-%20Legal%20Module.png"><img src="screenshots/26%20-%20Legal%20Module.png" alt="Legal Module" width="240" /></a>
  <a href="screenshots/27%20-%20Web%20Analytics.png"><img src="screenshots/27%20-%20Web%20Analytics.png" alt="Web Analytics" width="240" /></a>
  <a href="screenshots/28%20-%20Traffic%20Logs.png"><img src="screenshots/28%20-%20Traffic%20Logs.png" alt="Traffic Logs" width="240" /></a>
  <a href="screenshots/29%20-%20Server%20Logs.png"><img src="screenshots/29%20-%20Server%20Logs.png" alt="Server Logs" width="240" /></a>
  <a href="screenshots/30%20-%20Speed%20Insights.png"><img src="screenshots/30%20-%20Speed%20Insights.png" alt="Speed Insights" width="240" /></a>
  <a href="screenshots/31%20-%20Settings.png"><img src="screenshots/31%20-%20Settings.png" alt="Settings" width="240" /></a>
</p>

---

## Architecture

### Runtime Topology

- `apps/web` serves both storefront and admin routes (`/manage`) in a single React app
- `apps/backend` exposes the API at `/api/v1` and health endpoint at `/health`
- MongoDB persists operational and commerce data
- Optional S3-compatible object storage handles product/category media

### Backend Module Architecture

The backend registers domain modules for:

- `auth`, `users`
- `categories`, `products`
- `cart`, `orders`, `payments`
- `customers`, `dashboard`, `transactions`
- `settings`, `analytics`, `compliance`

Common cross-cutting middleware includes:

- CORS origin checks for local/prod hosts
- Helmet security headers
- Rate limiting (auth and general API buckets)
- Structured server logging and centralized error handling

### Frontend Architecture

- React Router based route segmentation for public and admin journeys
- Context-driven state for auth, admin auth, cart, toasts, and analytics
- API client wrappers with retry/refresh behavior for authenticated flows
- Componentized UI primitives under `apps/web/src/ui`

---

## Feature Map

### Customer Experience

- Homepage with curated discovery
- Category and product listing with search
- Product detail pages and cart workflow
- Checkout and payment result states
- Profile, address book, order history, and order detail pages
- OAuth callback support (Google)

### Admin Experience (`/manage`)

- KPI dashboard
- Product and category lifecycle management
- Order management and customer operations
- Transactions and reporting
- Analytics pages (traffic, speed, server logs, web analytics)
- Compliance pages:
  - business compliance overview
  - business authenticity
  - income tax records
  - licenses/certificates
  - legal documentation
- Settings tabs for business, shipping, payment, social, notifications, and account/security controls

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- React Router 6
- Vite
- Tailwind CSS + PostCSS
- Vitest + Testing Library

### Backend

- Node.js 20+
- Express 4
- TypeScript
- MongoDB + Mongoose
- Zod runtime validation
- JWT authentication
- `cors`, `helmet`, `express-rate-limit`
- Vitest

### Tooling and Workflow

- npm workspaces monorepo
- ESLint + Prettier
- Husky + lint-staged
- Docker multi-stage builds
- GitHub Actions for CI/CD

---

## Repository Layout

- `apps/web` - storefront + admin frontend
- `apps/backend` - API server
- `interfaces` - shared API/data contracts
- `types` - shared type helpers
- `constants` - cross-app constants
- `infra/nginx` - Nginx container config for reverse-proxy setups
- `docs` - deployment and operational docs
- `screenshots` - product preview assets used by this README

---

## Local Development

### Prerequisites

- Node.js `>=20`
- npm
- MongoDB (local) or Docker

### Setup

```bash
cp .env.example .env
npm install
```

Update `.env` with minimum required values:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_WEB_URL`
- `API_URL`
- `VITE_API_URL`

### Start the app

Run both apps:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:backend
npm run dev:web
```

### Local URLs

- Web: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/manage](http://localhost:3000/manage)
- Backend: [http://localhost:4000](http://localhost:4000)
- API: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- Health: [http://localhost:4000/health](http://localhost:4000/health)

### Seed data

Create admin:

```bash
MONGODB_URI=mongodb://localhost:27017/lunaz npm run seed:admin
```

Optional seed scripts:

```bash
npm run seed:products
npm run seed:data
npm run seed:all
```

Default admin credentials from the seed script:

- Email: `admin@lunaz.local`
- Password: `Admin123!`

---

## Docker Workflows

### Full local stack

```bash
docker compose up --build
```

### Useful Make targets

- `make docker-up` and `make docker-down`
- `make docker-up-db` to run only MongoDB for local Node/Vite development
- `make docker-logs`, `make docker-logs-backend`, `make docker-logs-web`
- `make docker-seed-admin`, `make docker-seed-products`, `make docker-seed-data`, `make docker-seed-all`

### Production-oriented targets

- `make prod-build`
- `make prod-up`
- `make prod-down`
- `make ec2-deploy` (requires `TAG` and `REGISTRY_IMAGE`)

---

## Configuration

The backend validates environment variables with Zod at startup.

### Core variables

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

### Frontend and CORS

- `FRONTEND_WEB_URL`
- `FRONTEND_MANAGE_URL` (optional)
- `API_URL`
- `VITE_API_URL` (frontend build-time API base)

### Storage and media

- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT` (optional S3-compatible endpoint URL)
- `S3_PUBLIC_URL` (optional CDN/public base URL)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Payment and auth integrations

- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWORD`
- `SSLCOMMERZ_SANDBOX`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (optional)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` (optional)

Never commit real secrets in `.env`.

---

## Scripts and Commands

### Root scripts

- `npm run dev`
- `npm run dev:backend`
- `npm run dev:web`
- `npm run build`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`
- `npm run test`
- `npm run ci`
- `npm run seed:admin`
- `npm run seed:products`
- `npm run seed:data`
- `npm run seed:all`

### Workspace-specific scripts

- Backend: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `seed:*`
- Web: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`

---

## API Surface

- Base path: `/api/v1`
- Health endpoint: `/health`
- Static SPA serving: enabled when backend `STATIC_DIR` is set

The backend groups routes by bounded domains:

- auth/users
- catalog (categories/products)
- shopping (cart/orders/payments)
- operations (customers/dashboard/transactions/settings)
- analytics and compliance

---

## Data and Integrations

### Database

- MongoDB via Mongoose models
- Operational entities include users, products, categories, cart, orders, settings, transactions, and compliance records

### Payments

- SSLCommerz and additional gateway abstractions in the payment module
- Payment callbacks and status routes are handled server-side

### OAuth

- Google OAuth support in frontend and backend auth flow
- Facebook credentials are supported in backend env schema for optional integration

### Storage

- S3-compatible media upload support for catalog assets

---

## Quality and CI/CD

### Local quality gates

- ESLint for linting
- Prettier for formatting
- TypeScript type checks
- Vitest test suites
- Husky and lint-staged for pre-commit hygiene

### GitHub Actions pipeline

- Lint and typecheck
- Test job with MongoDB service
- Build artifacts
- Docker image build/push (on `master`)
- Tag creation and release publishing workflow

---

## Troubleshooting

- **Push rejected (non-fast-forward)**: fetch/pull remote changes or switch remote URL to new ownership before pushing.
- **`HEAD (no branch)` state**: finish or abort rebase before any push (`git rebase --continue` or `git rebase --abort`).
- **CORS failures in browser**: verify `FRONTEND_WEB_URL`, `FRONTEND_MANAGE_URL`, and `VITE_API_URL` consistency.
- **OAuth callback mismatch**: confirm Google OAuth redirect URI and origin settings match deployment URL.
- **Images not loading**: verify screenshot filenames and URL-encoded paths in README links.

---

## Documentation

- Active docs and deployment notes: `docs/`
- Historical reference material: `docs/deprecated/`

---

## License

This project is licensed under the **Educational Use Only License (EUOL) v1.0**.

It is shared publicly on GitHub only for learning and study. Commercial,
production, or unauthorized reuse is not permitted.

See the full terms in `LICENSE`.
