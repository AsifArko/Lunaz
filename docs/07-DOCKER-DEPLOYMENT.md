# Lunaz — Docker and Deployment

## 1. Goals

- **Dockerized** — Each application (Backend, Web, Manage) runs in its own container.
- **Single-command run** — `docker-compose up` brings up the full stack for local development.
- **Configurable** — All settings via environment variables; no hardcoded URLs or secrets in images.

## 2. Images

### 2.1 Backend

- **Base:** `node:20-alpine` (or current LTS).
- **Build:** Copy `apps/backend` and `packages/types` (and any other shared packages); `npm ci` (or pnpm install); build TypeScript; run with `node dist/index.js` (or equivalent).
- **Dockerfile location:** `apps/backend/Dockerfile` or root `docker/backend.Dockerfile`.
- **Env:** Pass `MONGODB_URI`, `JWT_SECRET`, `S3_*`, `FRONTEND_*_URL`, etc. at runtime (see [02-BACKEND.md](./02-BACKEND.md)).

### 2.2 Web

- **Build:** Multi-stage; build React app (e.g. Vite build); serve with nginx or a minimal Node server.
- **Env at build time:** `VITE_API_URL` (or similar) for API base URL. Runtime env can be injected via a small script if needed.
- **Output:** Static files served on port 80 (or 3000).

### 2.3 Manage

- Same approach as Web: build React app; serve static files; env for API URL and any Manage-specific vars.

### 2.4 MongoDB

- Use official `mongo` or `mongo:7` image; no custom Dockerfile unless persistence or custom config is required.
- **Data:** Mount a named volume for data persistence across restarts.

### 2.5 S3 (local development)

- **MinIO:** Use `minio/minio` image to simulate S3; create bucket on first run (e.g. via init container or startup script).
- **Config:** `S3_ENDPOINT=http://minio:9000`, `S3_BUCKET=lunaz-products`; Backend uses path-style or virtual-hosted style as per MinIO docs.

## 3. Docker Compose (Local)

Example structure:

```yaml
# docker-compose.yml (root)
services:
  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    command: server /data
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    healthcheck:
      test: ['CMD', 'mc', 'ready', 'local']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - '4000:4000'
    environment:
      NODE_ENV: development
      PORT: 4000
      MONGODB_URI: mongodb://mongodb:27017/lunaz
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-prod}
      S3_BUCKET: lunaz-products
      S3_REGION: us-east-1
      S3_ENDPOINT: http://minio:9000
      AWS_ACCESS_KEY_ID: minioadmin
      AWS_SECRET_ACCESS_KEY: minioadmin
      FRONTEND_WEB_URL: http://localhost:3000
      FRONTEND_MANAGE_URL: http://localhost:3001
    depends_on:
      mongodb:
        condition: service_healthy
      minio:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - '3000:80'
    environment:
      VITE_API_URL: http://localhost:4000/api/v1
    depends_on:
      - backend

  manage:
    build:
      context: .
      dockerfile: apps/manage/Dockerfile
    ports:
      - '3001:80'
    environment:
      VITE_API_URL: http://localhost:4000/api/v1
    depends_on:
      - backend

volumes:
  mongodb_data:
  minio_data:
```

- **Secrets:** Use `env_file: .env` or Compose env vars; never commit `.env` with real secrets. Provide `.env.example` with placeholder values.
- **Networking:** Services communicate by service name (e.g. `http://backend:4000`). Frontend `VITE_API_URL` in browser must point to Backend as reachable by the user (e.g. `http://localhost:4000` for local).

## 4. Build Context (Monorepo)

- Dockerfiles at app level should use **context: monorepo root** so that `packages/types` and `packages/ui` can be copied. Example:

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
RUN npm ci
COPY packages/types ./packages/types
COPY apps/backend ./apps/backend
RUN npm run build --workspace=@lunaz/types
RUN npm run build --workspace=backend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/backend/dist .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json .
EXPOSE 4000
CMD ["node", "index.js"]
```

- Adjust for your workspace layout (pnpm/Yarn paths, build scripts).

## 5. Production Considerations

- **Secrets:** Use a secrets manager or orchestration secrets (e.g. Docker secrets, Kubernetes secrets); do not bake secrets into images.
- **MongoDB:** Use managed MongoDB (Atlas or equivalent) and set `MONGODB_URI` in production.
- **S3:** Use real AWS S3 or compatible; IAM roles preferred over long-lived keys when running on AWS.
- **Frontend URLs:** Set `FRONTEND_WEB_URL` and `FRONTEND_MANAGE_URL` to production domains for CORS and emails.
- **HTTPS:** Terminate TLS at load balancer or reverse proxy; Backend can run HTTP internally.
- **Health:** Orchestrator should use `/health` to check Backend; DB connectivity optional in health check.
- **Logging:** Stdout/stderr; collect with your logging platform (e.g. CloudWatch, Datadog).

## 6. Summary

- **Containers:** Backend, Web, Manage, MongoDB, MinIO (dev).
- **Config:** Environment variables only; document in `.env.example` and [02-BACKEND.md](./02-BACKEND.md).
- **Monorepo:** Build context at root; copy only needed apps and packages into each image.
- **Clean and configurable:** No hardcoded env; same Compose pattern can be adapted for CI or production deploy.
