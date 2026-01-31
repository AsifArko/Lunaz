# Lunaz — Manage Application (Admin CMS)

## 1. Overview

- **Stack:** TypeScript, React; shared `@lunaz/types`, `@lunaz/ui`.
- **Purpose:** Content management and operations: upload product information and images, set prices and sizes, view and manage orders, see sales, transactions, cash outs, and other useful business information.
- **Principles:** Strict typing, consistent UI with shared components, admin-only access, responsive for tablet/desktop.

## 2. Routes and Screens

### 2.1 Auth

| Route | Screen | Description |
|-------|--------|-------------|
| `/login` | Admin login | Email + password; backend validates role `admin`; JWT; redirect to dashboard |

### 2.2 Dashboard

| Route | Screen | Description |
|-------|--------|-------------|
| `/` or `/dashboard` | Dashboard | Key metrics: revenue (today/week/month), order count, top products; recent orders; quick links |

### 2.3 Products and catalog

| Route | Screen | Description |
|-------|--------|-------------|
| `/products` | Product list | Table: name, SKU, category, price, status; search and filter; pagination; link to create/edit |
| `/products/new` | Create product | Form: name, slug, description, category, base price, **variants** (size, SKU, price override, stock), status; **image upload** (multiple, S3 via backend) |
| `/products/:id` | Edit product | Same form; load existing; update; **upload/remove images** |
| `/categories` | Category list | List categories; CRUD |
| `/categories/new` | Create category | Name, slug, parent, image optional |
| `/categories/:id` | Edit category | Update category |

### 2.4 Orders and fulfilment

| Route | Screen | Description |
|-------|--------|-------------|
| `/orders` | Order list | Table: order number, date, customer, total, status; filter by status/date; search; link to detail |
| `/orders/:id` | Order detail | Full order: items, quantities, variants, prices, shipping address; **update order status** (e.g. Pending → Confirmed → Processing → Shipped → Delivered); optional notes |

### 2.5 Sales and finance

| Route | Screen | Description |
|-------|--------|-------------|
| `/transactions` | Transactions | List payment transactions: order, amount, method, status, date; filter by date/type |
| `/payouts` | Payouts / cash outs | List payouts; amount, status, reference, date |
| `/reports/sales` | Sales report | Revenue by period (day/week/month); chart or table; optional export (CSV) |
| `/reports/orders` | Orders report | Orders by status; count; optional export |

### 2.6 Customers and settings

| Route | Screen | Description |
|-------|--------|-------------|
| `/customers` | Customer list | Email, name, order count, last order; search; link to detail |
| `/customers/:id` | Customer detail | Profile; order history (read-only) |
| `/settings` | Settings | Store name, contact email; shipping zones; tax rules; optional feature flags |

### 2.7 Layout and guard

- **Layout:** Sidebar or top nav: Dashboard, Products, Categories, Orders, Transactions, Payouts, Reports, Customers, Settings. Header: admin user, logout.
- **Auth guard:** All routes except `/login` require admin JWT; redirect to `/login` if 401.

## 3. Feature Details

### 3.1 Product management

- **List:** GET `/api/v1/products` with pagination and filters; use `@lunaz/types` for row type. Actions: Edit, optional Duplicate, optional Archive/Delete.
- **Create/Edit:** Form fields aligned with backend and `@lunaz/types`: name, slug (auto from name or manual), description (rich text optional), category (select), base price, currency, status (draft/published). **Variants:** Add/remove rows: name (e.g. size), SKU, price override, stock. Submit POST/PATCH `/api/v1/products`.
- **Images:** Upload: select files → POST to backend (e.g. `/api/v1/products/:id/images`) or presigned URL; backend stores S3 URL in product. Display thumbnails; reorder (optional); delete (DELETE `/api/v1/products/:id/images/:imageId`). Use `@lunaz/ui` for file input and preview.

### 3.2 Categories

- **CRUD:** GET/POST/PATCH/DELETE `/api/v1/categories`. List with name, slug, product count; create/edit form: name, slug, parent category (optional), image URL optional.

### 3.3 Orders

- **List:** GET `/api/v1/orders` (admin sees all); filters: status, date range; search by order number or customer. Table: order number, date, customer email/name, total, status.
- **Detail:** GET `/api/v1/orders/:id`. Display: order number, date, status timeline, items (product, variant, qty, price), shipping address, totals. **Status update:** PATCH `/api/v1/orders/:id/status` with new status; optional notes. Use `@lunaz/types` for status enum and payload.

### 3.4 Transactions and payouts

- **Transactions:** GET `/api/v1/transactions`; query: dateFrom, dateTo, type. Table: order ID, amount, type (sale/refund), method, status, date. Data from backend (DB and/or payment provider).
- **Payouts:** GET `/api/v1/payouts`; list payouts (amount, status, reference, date). Optional: form to record a new payout (if not automated).
- **Sales report:** GET `/api/v1/reports/sales` (or aggregate on frontend); display chart (e.g. by day/week/month) and summary numbers; optional CSV export.

### 3.5 Customers

- **List:** GET users with role customer (backend may expose `/api/v1/customers` or use existing user list with filter). Columns: email, name, order count, last order date.
- **Detail:** User profile (read-only) and list of their orders; link to order detail.

### 3.6 Settings

- **Store:** Store name, support email; used in emails and footer.
- **Shipping/Tax:** Optional configuration for zones and tax rates; backend may expose GET/PATCH `/api/v1/settings` or similar.

## 4. API Client and Auth

- **Base URL:** From env (e.g. `VITE_API_URL`).
- **Auth:** Admin login only; JWT in header or cookie. All API calls use same backend; role middleware restricts Manage-only routes to `admin`.
- **Typing:** Use `@lunaz/types` for all API requests/responses and table row types.
- **Errors:** Handle 401 (redirect to login), 403, 4xx/5xx with alerts or toasts.

## 5. UI and UX

- **Components:** Use `@lunaz/ui` for buttons, inputs, tables, modals, cards, pagination, alerts. Consistent with Web where applicable.
- **Tables:** Sortable columns where useful; bulk actions (e.g. bulk status update) with confirmation.
- **Forms:** Validation (client-side with Zod or similar); clear error messages; loading state on submit.
- **Responsive:** Usable on tablet and desktop; sidebar may collapse on small screens.

## 6. Optional Enhancements

- **Audit log:** Log product edits and order status changes (user, timestamp, change); display in Manage.
- **Dashboard widgets:** Configurable widgets (revenue, orders, low stock).
- **Bulk product import:** CSV upload; map columns to product/variant fields; validate and create/update.
- **Notifications:** In-app or email when new order arrives (optional).

## 7. Build and Env

- **Build:** Vite or Next.js; env: `VITE_API_URL`. Docker build see [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md).

## 8. Summary

- **Manage** provides: **product upload** (info + **images**), **prices**, **sizes/variants**, categories; **orders** list and detail with **order status** updates; **transactions**, **payouts/cash outs**, **sales** and reports; **customers** list and detail; **settings**.
- All screens use **@lunaz/types** and **@lunaz/ui**; code is **strictly typed** and **configurable**; only users with role **admin** can access the app.
