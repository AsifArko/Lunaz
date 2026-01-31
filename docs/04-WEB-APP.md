# Lunaz — Web Application (Customer Storefront)

## 1. Overview

- **Stack:** TypeScript, React; shared `@lunaz/types`, `@lunaz/ui`.
- **Purpose:** Customer-facing storefront for lifestyle and home décor: browse products, view by category, see prices and sizes, add to cart, checkout, manage profile and orders.
- **Principles:** Strict typing, responsive design, accessible, SEO-friendly where applicable.

## 2. Routes and Pages

### 2.1 Public

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, featured categories, featured/latest products, promotions |
| `/categories` | Category list | List all categories (grid or list) |
| `/categories/:slug` | Category products | Products in category; sort and filter |
| `/products` | Product listing | All products; search, sort, filter; pagination |
| `/products/:slug` | Product detail | Gallery, title, description, **price**, **sizes/variants**, stock, **Add to cart** |
| `/search` | Search results | Query param `q`; same listing behaviour as products |
| `/cart` | Cart | Line items, quantities, variant, unit price, line total; update/remove; link to checkout |
| `/login` | Login | Email + password; redirect after login (cart or account) |
| `/register` | Register | Email, name, password; validation; redirect to login or home |
| `/forgot-password` | Forgot password | Request reset link (if backend supports) |

### 2.2 Authenticated (customer)

| Route | Page | Description |
|-------|------|-------------|
| `/checkout` | Checkout | Shipping address (new or saved), order summary; place order; confirmation |
| `/account` | Account home | Links to profile, addresses, orders |
| `/account/profile` | Profile | View/edit name, email; change password |
| `/account/addresses` | Addresses | List, add, edit, delete; set default |
| `/account/orders` | Order history | List orders (date, status, total); link to detail |
| `/account/orders/:id` | Order detail | Status, items, address, totals; tracking if available |

### 2.3 Shared components and layout

- **Layout:** Header (logo, nav, search, cart icon, account/login), footer (links, contact).
- **Cart icon:** Badge with item count; link to `/cart`.
- **Auth guard:** Redirect unauthenticated users from `/checkout` and `/account/*` to `/login` (with return URL).

## 3. Feature Details

### 3.1 Product discovery

- **Categories:** Fetch from `/api/v1/categories`; display on home and in nav/mega-menu. Category page: `/api/v1/products?category=:id`.
- **Product listing:** Grid/list; image, name, price (base or first variant), optional “In stock” badge. Sort: price low/high, newest. Filter: category, price range. Pagination or infinite scroll.
- **Search:** Input in header; submit to `/search?q=...`; call `/api/v1/products?search=...`; same listing UI.
- **Product detail:** Fetch `/api/v1/products/:id` (or by slug). Show:
  - Image gallery (multiple S3 images); primary image; optional zoom.
  - Title, description.
  - **Price** (from base or selected variant).
  - **Sizes/variants** — dropdown or buttons; on change update price and stock.
  - Stock: “In stock”, “Low stock”, “Out of stock” (from variant or product).
  - **Add to cart** — select variant and quantity; add; optional “View cart” or stay on page with toast.

### 3.2 Cart

- **Persistence:** Guest: localStorage (e.g. key `lunaz_cart`). Logged-in: sync with `/api/v1/cart` (GET/PUT); on login merge guest cart into backend cart.
- **Cart page:** List items (image, name, variant, quantity, unit price, line total). Update quantity; remove line. Subtotal; link to checkout.
- **Validation:** On load and before checkout, validate availability (optional server-side check); show message if item unavailable.

### 3.3 Checkout

- **Address:** Form or select saved address; required: line1, city, postalCode, country. Optional: line2, state. Save new address to `/api/v1/users/me/addresses` and use for order.
- **Order summary:** Items, subtotal, shipping (fixed or calculated), tax (if applicable), total. Use types from `@lunaz/types`.
- **Place order:** POST `/api/v1/orders` with address and cart reference; on success redirect to order confirmation (e.g. `/account/orders/:id?confirmed=1`) and clear cart.
- **Payment:** If payment is collected at checkout, integrate Stripe (or chosen provider) in this flow (e.g. Payment Element); backend creates PaymentIntent and confirms via webhook.

### 3.4 User account and auth

- **Login/Register:** Forms with validation; call backend; store JWT (cookie or memory + localStorage); set user in app state (e.g. context); redirect.
- **Profile:** GET/PATCH `/api/v1/users/me`; form for name, email; separate form for password change (PUT `/api/v1/users/me/password`).
- **Addresses:** CRUD via `/api/v1/users/me/addresses`; “Set as default” PATCH.
- **Order history:** GET `/api/v1/orders` (customer sees own); list with date, status, total; link to `/account/orders/:id`.
- **Order detail:** GET `/api/v1/orders/:id`; show status, timeline, items, address, totals; optional tracking link.

## 4. API Client

- **Base URL:** From env (e.g. `VITE_API_URL`).
- **Auth:** Attach JWT to requests (e.g. `Authorization: Bearer <token>` or cookie).
- **Typing:** Use `@lunaz/types` for request/response; typed fetch or axios wrapper.
- **Errors:** Handle 401 (logout, redirect to login), 403, 404, 4xx/5xx with user-friendly messages.

## 5. State and Data

- **Auth state:** Context or global state (user, token, logout). Persist token as chosen (cookie vs localStorage).
- **Cart state:** Context or global state; sync with backend when logged in; persist guest cart in localStorage.
- **Data fetching:** React Query or SWR for products, categories, orders; cache and invalidation as needed.

## 6. UI and UX

- **Design:** Use `@lunaz/ui` for buttons, inputs, cards, modals, tables, price display; consistent spacing and typography.
- **Responsive:** Mobile-first or breakpoints; nav collapses to menu on small screens; product grid adapts.
- **Loading:** Skeletons or spinners for lists and detail; disable buttons during submit.
- **Feedback:** Toasts or inline messages for “Added to cart”, “Order placed”, errors.
- **Accessibility:** Semantic HTML; ARIA where needed; keyboard navigation; focus management in modals.

## 7. SEO

- **Meta:** Title and description per page (e.g. React Helmet or framework equivalent).
- **Product/category:** Dynamic meta from product/category name and description.
- **URLs:** Clean slugs for categories and products.
- **Optional:** Sitemap, structured data (Product) for product pages.

## 8. Build and Env

- **Build:** Vite or Next.js; output static (or SSR if Next). Env: `VITE_API_URL` (or equivalent).
- **Docker:** See [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md); build step bakes API URL or inject at runtime via script.

## 9. Summary

- **Web** provides: home, categories, product listing/detail (with **price**, **sizes**, **add to cart**), cart, checkout, login/register, **profile**, **addresses**, **order history**, **order status**.
- All data and API contracts use **@lunaz/types**; UI uses **@lunaz/ui** where applicable; code is **strictly typed** and **configurable** via environment variables.
