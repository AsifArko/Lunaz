# Lunaz E-Commerce — Main Specification

**Version:** 1  
**Scope:** Lifestyle and home décor online store — Web (customer), Manage (admin CMS), and Backend.

---

## 1. Project Overview

### 1.1 Purpose

Lunaz is a professional online store for **lifestyle and home décor** products. It consists of:

- **Web** — Customer-facing React application for browsing, cart, checkout, orders, and account.
- **Manage** — React admin application (CMS) for product management, images, prices, orders, sales, transactions, and reporting.
- **Backend** — TypeScript/Node.js API serving both Web and Manage; MongoDB as primary database; S3 for product images.

All applications must be **strictly typed**, **configurable**, **modular**, and **Dockerized**. Web and Manage share reusable components and a common set of TypeScript interfaces/types.

### 1.2 Core Principles

- **Strict typing** — TypeScript end-to-end (Web, Manage, Backend).
- **Shared contracts** — Common interfaces/types used by Backend, Web, and Manage (shared package(s)).
- **Reusable UI** — Shared React components between Web and Manage where applicable.
- **Clean, modular code** — Clear separation of domains, services, and configuration.
- **Configurable** — Environment-based config; no hardcoded secrets or environment-specific values in code.

---

## 2. Architecture Summary

- **Monorepo** — Single repository containing `apps/web`, `apps/manage`, `apps/backend`, and `packages/*` (e.g. `packages/types`, `packages/ui`, `packages/config`).
- **Backend** — REST API (optionally GraphQL later); JWT-based auth; role-based access (customer vs admin).
- **Database** — MongoDB; structured collections for users, products, categories, orders, transactions, etc.
- **Storage** — AWS S3 (or S3-compatible) for product images; Backend handles upload/URL generation.
- **Docker** — Each app containerized; `docker-compose` for local and deployment (Backend, Web, Manage, MongoDB, optional S3 local).

See [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) for folder structure and boundaries.

---

## 3. Technology Stack

| Layer            | Technology                                                                             |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Web**          | TypeScript, React, build (Vite/Next.js as chosen), shared `@lunaz/ui`, `@lunaz/types`  |
| **Manage**       | TypeScript, React, same shared packages                                                |
| **Backend**      | TypeScript, Node.js (Express or Fastify), MongoDB driver (e.g. Mongoose), AWS SDK (S3) |
| **Database**     | MongoDB                                                                                |
| **File storage** | AWS S3                                                                                 |
| **Auth**         | JWT; secure HTTP-only cookies or Bearer token as chosen                                |
| **Validation**   | Shared schemas (e.g. Zod) in packages; used by Backend and optionally frontends        |
| **Containers**   | Docker, Docker Compose                                                                 |

---

## 4. Feature Requirements

### 4.1 Customer-Facing (Web Application)

#### 4.1.1 Product Discovery

- **Categories** — Browse products by category (e.g. Furniture, Lighting, Textiles, Décor). Category list and category-specific product listing.
- **Product listing** — Grid/list of products with image, name, price, primary variant (e.g. default size). Pagination or infinite scroll.
- **Sorting and filtering** — Sort by price (low/high), newest; filter by category, price range, size/attribute if applicable.
- **Search** — Full-text or keyword search over product name and description; results page with same sort/filter behaviour.
- **Product detail** — Single product page: gallery (multiple images from S3), title, description, **price**, **sizes/variants** (e.g. S/M/L or dimensions), stock indication (e.g. “In stock” / “Low stock” / “Out of stock”), **Add to cart** (with variant selection).

#### 4.1.2 Cart and Checkout

- **Cart** — Add/update/remove items; show variant (e.g. size), quantity, unit price, line total; persist cart (e.g. localStorage and/or backend for logged-in users).
- **Checkout** — Shipping address (new or saved), billing if required; order summary (items, subtotal, shipping, tax if applicable, total); place order; redirect to order confirmation.

#### 4.1.3 User Account and Auth

- **Registration** — Email (and optionally name, password); validation; optional email verification.
- **Login / Logout** — Secure session (JWT); “Remember me” optional.
- **Profile** — View and edit name, email, password change; optional avatar.
- **Addresses** — CRUD for shipping/billing addresses; default shipping address for checkout.
- **Order history** — List of orders with date, status, total; link to order detail.
- **Order detail** — Order status, line items, shipping address, payment/summary; tracking info if available.

#### 4.1.4 General Web

- **Home** — Hero, featured categories, featured or latest products, optional promotions.
- **Responsive** — Usable on mobile and desktop.
- **SEO** — Meta title/description per page; semantic HTML; optional sitemap.
- **Accessibility** — Keyboard navigation, ARIA where needed, focus management.

---

### 4.2 Admin / CMS (Manage Application)

#### 4.2.1 Product Management

- **Product list** — All products with key fields (name, SKU, price, category, status); search and filter; pagination.
- **Create/Edit product** — Name, slug, description, category, **prices**, **sizes/variants** (with SKU and optional stock per variant), status (draft/published). **Image upload** — multiple images per product; upload to S3 via Backend; set order/primary image.
- **Categories** — CRUD for categories (name, slug, parent if hierarchy, image optional).
- **Bulk actions** — Bulk status update, bulk delete (with confirmation); optional CSV import/export.

#### 4.2.2 Orders and Fulfilment

- **Order list** — All orders with date, customer, total, status; filter by status/date; search by order ID or customer.
- **Order detail** — Full order info: items, quantities, variants, prices, shipping address, status timeline; **update order status** (e.g. Pending → Confirmed → Processing → Shipped → Delivered).
- **Order status** — Configurable statuses; optional email to customer on status change.

#### 4.2.3 Sales and Finance

- **Sales overview** — Revenue by day/week/month; number of orders; key metrics on dashboard.
- **Transactions** — List of payment transactions (order ID, amount, method, status, date); filter by date/status.
- **Cash outs / Payouts** — If applicable: record or view payouts to bank; balance/summary.
- **Reports** — Sales by period; top products; orders by status; optional export (CSV/PDF).

#### 4.2.4 Customers and Content

- **Customers** — List of registered users (email, name, order count, last order); view detail (profile, order history) for support.
- **Content** — Optional: homepage banners, promotional blocks; managed in Manage and consumed by Web.
- **Settings** — Store name, contact email, shipping zones, tax rules (if needed); feature flags if any.

#### 4.2.5 Admin Security and UX

- **Auth** — Admin-only login; role-based access so only authorised users see Manage.
- **Audit** — Optional: log who changed what (e.g. product updates, order status changes).
- **UI** — Consistent with shared components; responsive for tablet/desktop.

---

### 4.3 Backend (API and Services)

#### 4.3.1 Authentication and Authorisation

- **Registration / Login** — Issue JWT; refresh token optional; password hashing (e.g. bcrypt).
- **Roles** — `customer` (Web) and `admin` (Manage); middleware to protect routes by role.
- **Password reset** — Forgot password flow: tokenised link, reset password endpoint.

#### 4.3.2 Product and Catalog

- **Products** — CRUD; list with pagination, filter by category/status; search.
- **Categories** — CRUD; tree or flat list for Web and Manage.
- **Images** — Presigned upload to S3 or server-side upload; store URLs in product document; delete from S3 on product/image delete.

#### 4.3.3 Cart and Orders

- **Cart** — For logged-in users: save/update cart on Backend; merge with guest cart on login.
- **Orders** — Create order from cart; validate stock; persist order with line items, addresses, totals; update inventory if applicable.
- **Order status** — Update status (Manage only); optional webhooks or events for notifications.

#### 4.3.4 User and Profile

- **Profile** — Get/update profile; change password; address CRUD; default address.

#### 4.3.5 Payments and Finance (Integration Points)

- **Payments** — Integrate with a payment provider (e.g. Stripe): create payment intent, confirm, webhooks for success/failure; store transaction id and status.
- **Transactions / Payouts** — Endpoints for Manage to list transactions and payouts; data sourced from DB and/or payment provider API.

#### 4.3.6 Other Backend Concerns

- **Config** — Environment variables for DB URL, S3 bucket/region, JWT secret, payment keys, app URLs.
- **Validation** — All inputs validated (e.g. Zod) using shared schemas where possible.
- **Errors** — Consistent error format; appropriate HTTP status codes.
- **Security** — CORS, rate limiting, helmet; no secrets in responses.
- **Health** — Health check endpoint for Docker/orchestration.

---

## 5. Data and Shared Contracts

- **Single source of truth for types** — All DTOs, enums, and API contracts live in shared package(s) (e.g. `@lunaz/types`). Backend and both frontends consume them.
- **Product** — id, name, slug, description, categoryId, price(s), variants (size, SKU, price override, stock), image URLs, status, timestamps.
- **Order** — id, userId, items (productId, variantId, quantity, price), totals, shipping address, status, payment ref, timestamps.
- **User** — id, email, name, role, password hash, addresses, timestamps.

See [03-DATABASE.md](./03-DATABASE.md) and [06-SHARED-PACKAGES.md](./06-SHARED-PACKAGES.md) for full schemas and shared interfaces.

---

## 6. Non-Functional Requirements

- **Modularity** — Features grouped into domains/modules (auth, products, orders, etc.) in Backend and in Web/Manage.
- **Configurability** — All environment-specific and deploy-specific values in config/env; no hardcoded URLs or keys.
- **Docker** — Each app runs in Docker; one `docker-compose` to run full stack (Backend, Web, Manage, MongoDB, optional local S3).
- **Code quality** — Consistent formatting (e.g. Prettier), linting (e.g. ESLint), and strict TypeScript.

---

## 7. Optional / Future Enhancements

- **Discounts and coupons** — Code-based or automatic discounts; usage limits.
- **Inventory** — Stock per variant; low-stock alerts; reserve stock on checkout.
- **Reviews and ratings** — Customer reviews on products; moderation in Manage.
- **Wishlist** — Save items for later; sync across devices when logged in.
- **Email** — Order confirmation, shipping updates, password reset via email service (e.g. SendGrid).
- **Multi-currency** — Display and charge in multiple currencies (configurable).
- **Returns and refunds** — Return request flow; refund via payment provider; status in Manage.
- **Analytics** — ✅ **Implemented** — See [09-ANALYTICS-AND-LOGGING.md](./09-ANALYTICS-AND-LOGGING.md) for self-hosted analytics, traffic logging, speed insights, user behavior tracking, and server logging.
- **SEO** — Sitemap generation; structured data (e.g. Product schema).
- **i18n** — Multiple languages for Web and/or Manage (if required later).

---

## 8. Document Map

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) — Monorepo and shared packages layout.
- [02-BACKEND.md](./02-BACKEND.md) — API design, services, auth, S3, validation.
- [03-DATABASE.md](./03-DATABASE.md) — MongoDB collections and indexes.
- [04-WEB-APP.md](./04-WEB-APP.md) — Web app pages, routes, and UX.
- [05-MANAGE-APP.md](./05-MANAGE-APP.md) — Manage app screens and workflows.
- [06-SHARED-PACKAGES.md](./06-SHARED-PACKAGES.md) — Shared types and UI components.
- [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md) — Docker and deployment.
- [08-FEATURES-MATRIX.md](./08-FEATURES-MATRIX.md) — Feature list and phasing.
- [09-ANALYTICS-AND-LOGGING.md](./09-ANALYTICS-AND-LOGGING.md) — Self-hosted analytics, traffic logs, speed insights, user behavior, and server logging.

This specification is the single high-level reference; the numbered documents provide implementation-level detail for each area.
