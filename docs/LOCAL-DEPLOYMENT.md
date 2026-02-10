# Lunaz — Running Locally (Local “Deploy” for Testing)

You can run the full stack on your machine in two ways: **all-in-Docker** (one command) or **hybrid** (DB in Docker, apps with `npm run dev:*` for hot reload). Both assume you have **Docker** and **Node.js 20+** installed.

---

## Option 1: Full stack in Docker (simplest)

Best for: quickly running the whole app without running three dev servers.

1. **Start everything** (MongoDB, MinIO, Backend, Web, Manage):

   ```bash
   docker compose up --build
   ```

   Or in the background:

   ```bash
   make docker-up-build
   # or: docker compose up -d --build
   ```

2. **Create an admin user** (first time only):

   ```bash
   make docker-seed-admin
   # or: docker compose exec backend npm run seed:admin
   ```

3. **Open in browser:**
   - **Web (storefront):** http://localhost:3000
   - **Manage (admin):** http://localhost:3001
   - **Backend API:** http://localhost:4000
   - **Health:** http://localhost:4000/health
   - **MinIO console:** http://localhost:9001 (minioadmin / minioadmin)

**Stop:** `make docker-down` or `docker compose down`

---

## Option 2: DB in Docker, apps with npm (dev with hot reload)

Best for: daily development with `npm run dev:backend`, `dev:web`, and `dev:manage`, with the database (and optional S3) running in Docker.

### 1. Start only MongoDB (and MinIO)

```bash
make docker-up-db
```

This starts:

- **MongoDB** on `localhost:27017` (database `lunaz`)
- **MinIO** on `localhost:9000` (API) and `localhost:9001` (console)
- MinIO bucket `lunaz-products` is created automatically

Your `.env` should already have:

- `MONGODB_URI=mongodb://localhost:27017/lunaz`
- Optional S3/MinIO vars if you use file uploads (see `.env` and [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md))

### 2. Install and build (first time only)

```bash
npm install
npm run build --workspace=@lunaz/types
npm run build --workspace=@lunaz/config
npm run build --workspace=@lunaz/ui
npm run build --workspace=backend
```

### 3. Seed admin (first time only)

```bash
MONGODB_URI=mongodb://localhost:27017/lunaz npm run seed:admin
# Or: make seed-admin (requires MONGODB_URI in env)
```

### 4. Run the three dev servers

Use **three terminals** (or a process manager):

| Terminal | Command               | URL                   |
| -------- | --------------------- | --------------------- |
| 1        | `npm run dev:backend` | http://localhost:4000 |
| 2        | `npm run dev:web`     | http://localhost:3000 |
| 3        | `npm run dev:manage`  | http://localhost:3001 |

Backend must be up before using Web or Manage (they call the API). Order: start **backend** first, then **web** and **manage**.

**Optional:** Seed products and other data:

```bash
npm run seed:products   # categories and products
npm run seed:data       # customers, orders, transactions
# or: npm run seed:all
```

### 5. Stop DB (when done)

```bash
make docker-down
# or: docker compose down
```

---

## Summary

| Goal                         | Use                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| “Deploy” locally for testing | **Option 1** — `docker compose up --build`                                             |
| Develop with hot reload      | **Option 2** — `make docker-up-db` then `npm run dev:backend`, `dev:web`, `dev:manage` |

Both options keep the database (and optionally MinIO) consistent. When you move to **AWS**, you’ll replace the Dockerized MongoDB with a managed service (e.g. DocumentDB or Atlas) and run Backend/Web/Manage on ECS, EKS, or Lambda; the same env vars and Docker setup from Option 1 translate well to that workflow.
