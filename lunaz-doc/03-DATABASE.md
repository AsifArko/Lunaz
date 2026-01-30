# Lunaz — Database Specification (MongoDB)

## 1. Overview

- **Database:** MongoDB
- **ODM/Driver:** Mongoose or native `mongodb` driver; documents should align with types in `@lunaz/types`.
- **Naming:** Collections plural, camelCase for field names; `_id` as ObjectId.

## 2. Collections and Schemas

### 2.1 users

Stores customer and admin accounts.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `email` | string | Unique, lowercase |
| `passwordHash` | string | bcrypt |
| `name` | string | |
| `role` | enum | `customer` \| `admin` |
| `emailVerified` | boolean | Optional; default false |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `email` (unique).

---

### 2.2 addresses (embedded or separate collection)

If embedded in `users`: `users.addresses` array.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | For embedded: subdocument id |
| `label` | string | e.g. "Home" |
| `line1` | string | |
| `line2` | string | Optional |
| `city` | string | |
| `state` | string | Optional |
| `postalCode` | string | |
| `country` | string | ISO code |
| `isDefault` | boolean | One default per user |

If separate collection: add `userId` (ObjectId, indexed).

---

### 2.3 categories

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | string | |
| `slug` | string | Unique, URL-safe |
| `parentId` | ObjectId | Optional; for hierarchy |
| `imageUrl` | string | Optional |
| `order` | number | Optional; display order |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `slug` (unique), `parentId`, `order`.

---

### 2.4 products

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | string | |
| `slug` | string | Unique |
| `description` | string | Optional; rich text or plain |
| `categoryId` | ObjectId | Ref categories |
| `status` | enum | `draft` \| `published` |
| `basePrice` | number | Default price (e.g. cents or main currency unit) |
| `currency` | string | e.g. `USD` |
| `variants` | array | See below |
| `images` | array | `{ id, url, order }`; S3 URLs |
| `meta` | object | Optional; SEO title, description |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Variant (embedded):**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | UUID or short id |
| `name` | string | e.g. "Small", "Medium" |
| `sku` | string | Optional, unique per product |
| `priceOverride` | number | Optional; overrides basePrice |
| `stock` | number | Optional; for inventory |
| `attributes` | object | e.g. `{ size: "M" }` |

**Indexes:** `slug` (unique), `categoryId`, `status`, `createdAt`. Optional: text index on `name`, `description` for search.

---

### 2.5 carts

Persisted cart for logged-in users.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId | Unique (one cart per user) |
| `items` | array | See below |
| `updatedAt` | Date | |

**Cart item (embedded):**

| Field | Type | Notes |
|-------|------|-------|
| `productId` | ObjectId | |
| `variantId` | string | From product.variants[].id |
| `quantity` | number | |
| `addedAt` | Date | Optional |

**Indexes:** `userId` (unique).

---

### 2.6 orders

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `orderNumber` | string | Human-readable; unique (e.g. LN-10001) |
| `userId` | ObjectId | Ref users |
| `status` | enum | See below |
| `items` | array | See below |
| `subtotal` | number | Sum of line totals |
| `shippingAmount` | number | |
| `taxAmount` | number | Optional |
| `total` | number | |
| `currency` | string | |
| `shippingAddress` | object | Snapshot: line1, city, postalCode, country, etc. |
| `billingAddress` | object | Optional snapshot |
| `paymentIntentId` | string | Optional; Stripe etc. |
| `paymentStatus` | enum | `pending` \| `paid` \| `failed` \| `refunded` |
| `notes` | string | Optional; customer or admin |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Order status enum (suggested):** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`.

**Order item (embedded):**

| Field | Type | Notes |
|-------|------|-------|
| `productId` | ObjectId | |
| `variantId` | string | |
| `productName` | string | Snapshot |
| `variantName` | string | Snapshot |
| `quantity` | number | |
| `unitPrice` | number | |
| `total` | number | |
| `imageUrl` | string | Optional snapshot |

**Indexes:** `orderNumber` (unique), `userId`, `status`, `createdAt` (desc for listing).

---

### 2.7 transactions

Payment-related records for reporting and payouts.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `orderId` | ObjectId | Ref orders |
| `type` | enum | `sale` \| `refund` \| `payout` |
| `amount` | number | Positive for sale, negative for refund/payout |
| `currency` | string | |
| `paymentMethod` | string | e.g. `stripe` |
| `externalId` | string | Provider transaction id |
| `status` | enum | `pending` \| `completed` \| `failed` |
| `metadata` | object | Optional |
| `createdAt` | Date | |

**Indexes:** `orderId`, `type`, `createdAt`, `externalId`.

---

### 2.8 payouts (optional)

If tracking cash outs separately.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `amount` | number | |
| `currency` | string | |
| `status` | enum | `pending` \| `completed` \| `failed` |
| `reference` | string | Bank ref etc. |
| `createdAt` | Date | |
| `completedAt` | Date | Optional |

---

### 2.9 password_reset_tokens (optional)

For forgot-password flow.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `token` | string | Hashed or random |
| `expiresAt` | Date | |
| `createdAt` | Date | |

**Indexes:** `token`, `expiresAt` (TTL index for cleanup).

---

## 3. Shared Types

All of the above shapes should have matching interfaces in `@lunaz/types` (e.g. `User`, `Product`, `Order`, `OrderItem`, `Cart`, `Category`, `Transaction`). Use same field names and types so Backend and frontends stay in sync.

## 4. Migrations and Seeding

- Document any schema change in `lunaz-doc` or a `migrations/` folder.
- Optional seed script: default admin user, sample categories, sample products for dev.
- Use MongoDB migrations or manual scripts as preferred; avoid destructive defaults in production.
