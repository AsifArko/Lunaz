# Lunaz — Features Matrix and Priorities

## 1. Feature Checklist

Use this matrix to track coverage across Web, Manage, and Backend. **P** = Planned / Required; **O** = Optional / Later; **—** = Not applicable.

### 1.1 Product and catalog

| Feature                                       | Web                      | Manage            | Backend |
| --------------------------------------------- | ------------------------ | ----------------- | ------- |
| List products by category                     | P                        | —                 | P       |
| Product detail (price, sizes, images)         | P                        | —                 | P       |
| Sort/filter products                          | P                        | P                 | P       |
| Search products                               | P                        | P                 | P       |
| Product CRUD                                  | —                        | P                 | P       |
| Product variants (sizes, SKU, price override) | P (display, add to cart) | P (edit)          | P       |
| Product images (multiple, S3)                 | P (display)              | P (upload/delete) | P       |
| Category CRUD                                 | —                        | P                 | P       |
| Category list / tree                          | P                        | P                 | P       |
| Product status (draft/published)              | P (only published)       | P                 | P       |
| Stock per variant                             | P (display)              | P (edit)          | P       |
| Bulk product actions                          | —                        | O                 | O       |

### 1.2 Cart and checkout

| Feature                           | Web | Manage | Backend     |
| --------------------------------- | --- | ------ | ----------- |
| Add to cart (with variant)        | P   | —      | P           |
| Update/remove cart items          | P   | —      | P           |
| Persist cart (guest + logged-in)  | P   | —      | P           |
| Checkout (address, summary)       | P   | —      | P           |
| Place order                       | P   | —      | P           |
| Order confirmation                | P   | —      | P           |
| Payment integration (e.g. Stripe) | P   | —      | P (webhook) |

### 1.3 User and auth

| Feature                      | Web | Manage | Backend |
| ---------------------------- | --- | ------ | ------- |
| Register                     | P   | —      | P       |
| Login / Logout               | P   | P      | P       |
| JWT, role (customer / admin) | P   | P      | P       |
| Forgot / reset password      | O   | O      | P       |
| Profile (view/edit)          | P   | —      | P       |
| Change password              | P   | —      | P       |
| Addresses CRUD, default      | P   | —      | P       |

### 1.4 Orders

| Feature                          | Web | Manage | Backend |
| -------------------------------- | --- | ------ | ------- |
| Order history (customer)         | P   | —      | P       |
| Order detail (customer)          | P   | —      | P       |
| Order status display             | P   | —      | P       |
| Order list (admin, all)          | —   | P      | P       |
| Order detail (admin)             | —   | P      | P       |
| Update order status (admin)      | —   | P      | P       |
| Order number / human-readable id | P   | P      | P       |

### 1.5 Sales and finance

| Feature                  | Web | Manage | Backend |
| ------------------------ | --- | ------ | ------- |
| Transactions list        | —   | P      | P       |
| Payouts / cash outs list | —   | P      | P       |
| Sales report (by period) | —   | P      | P       |
| Dashboard metrics        | —   | P      | P       |
| Export (CSV/PDF)         | —   | O      | O       |

### 1.6 Customers and content

| Feature                    | Web | Manage | Backend |
| -------------------------- | --- | ------ | ------- |
| Customer list (admin)      | —   | P      | P       |
| Customer detail (admin)    | —   | P      | P       |
| Store settings             | —   | P      | O       |
| Homepage content / banners | O   | O      | O       |

### 1.7 Infrastructure and quality

| Feature                            | Web | Manage | Backend |
| ---------------------------------- | --- | ------ | ------- |
| Strict TypeScript                  | P   | P      | P       |
| Shared types (@lunaz/types)        | P   | P      | P       |
| Shared UI (@lunaz/ui)              | P   | P      | —       |
| Configurable (env)                 | P   | P      | P       |
| Dockerized                         | P   | P      | P       |
| Health check                       | —   | —      | P       |
| CORS, rate limit, security headers | —   | —      | P       |
| Validation (Zod)                   | O   | O      | P       |

### 1.8 Optional / future

| Feature                           | Web | Manage | Backend |
| --------------------------------- | --- | ------ | ------- |
| Discounts / coupons               | O   | O      | O       |
| Inventory alerts                  | —   | O      | O       |
| Reviews / ratings                 | O   | O      | O       |
| Wishlist                          | O   | —      | O       |
| Email (order confirmation, reset) | —   | —      | O       |
| Returns / refunds                 | O   | O      | O       |
| Multi-currency                    | O   | O      | O       |
| Audit log (admin)                 | —   | O      | O       |
| SEO (sitemap, structured data)    | O   | —      | O       |
| i18n                              | O   | O      | O       |

---

## 2. Phasing Suggestion

### Phase 1 — Core store (MVP)

- **Backend:** Auth (register, login, JWT, roles), categories CRUD, products CRUD with variants and S3 images, cart, orders create/list/detail, order status update, health.
- **Web:** Home, categories, product list/detail (price, sizes, add to cart), cart, checkout, login/register, profile, addresses, order history and detail.
- **Manage:** Login, dashboard (basic), product list/create/edit with images and variants, category CRUD, order list/detail and status update.
- **Shared:** `@lunaz/types` with core entities and API types; `@lunaz/ui` with primitives and layout used by Web and Manage.
- **Infra:** Docker Compose (Backend, Web, Manage, MongoDB).

### Phase 2 — Sales and operations

- **Backend:** Transactions and payouts endpoints, sales report aggregation.
- **Manage:** Transactions list, payouts list, sales report, customer list/detail, settings (store info).
- **Optional:** Payment provider integration (Stripe) end-to-end; email (order confirmation).

### Phase 3 — Polish and optional features

- **All:** Forgot/reset password, better validation and error messages.
- **Web:** Search, filters, SEO meta, accessibility pass.
- **Manage:** Bulk actions, export CSV, audit log (optional).
- **Optional:** Discounts, inventory alerts, reviews, wishlist, returns/refunds, i18n.

---

## 3. Summary

- **P** items are required for a professional online store as per the main spec; **O** items are recommended or future.
- All three apps (Web, Manage, Backend) share **strict typing** and **@lunaz/types**; Web and Manage share **@lunaz/ui**; everything is **configurable** and **Dockerized** as specified in [SPECIFICATION.md](./SPECIFICATION.md) and [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md).
