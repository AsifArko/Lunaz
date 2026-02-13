# ============================================================================
# Lunaz — Full stack (backend + web + manage) for AWS ECS
# ============================================================================
# Build context: repo root
# Usage: docker build -t lunaz .
# Single-container deployment: backend serves static files when STATIC_DIR is set.
# ============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies (all workspaces)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY apps/manage/package.json ./apps/manage/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/

RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Build backend (types, config, backend)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder-backend
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/apps/backend/package.json ./apps/backend/
COPY --from=deps /app/packages/types/package.json ./packages/types/
COPY --from=deps /app/packages/config/package.json ./packages/config/

COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY apps/backend ./apps/backend

RUN npm run build --workspace=@lunaz/types && \
    npm run build --workspace=@lunaz/config && \
    npm run build --workspace=backend

# -----------------------------------------------------------------------------
# Stage 3: Build web (types, ui, web)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder-web
WORKDIR /app

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/apps/web/package.json ./apps/web/
COPY --from=deps /app/packages/types/package.json ./packages/types/
COPY --from=deps /app/packages/ui/package.json ./packages/ui/

COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web

RUN npm run build --workspace=@lunaz/types && \
    npm run build --workspace=@lunaz/ui && \
    npm run build --workspace=web

# -----------------------------------------------------------------------------
# Stage 4: Build manage (types, ui, manage) with base /manage/
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder-manage
WORKDIR /app

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/apps/manage/package.json ./apps/manage/
COPY --from=deps /app/packages/types/package.json ./packages/types/
COPY --from=deps /app/packages/ui/package.json ./packages/ui/

COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY apps/manage ./apps/manage

RUN npm run build --workspace=@lunaz/types && \
    npm run build --workspace=@lunaz/ui && \
    npm run build --workspace=manage -- --base=/manage/

# -----------------------------------------------------------------------------
# Stage 5: Production (Node only — single process on 8080)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Backend runtime: production deps only
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

RUN npm ci --omit=dev && npm cache clean --force

# Backend built output
COPY --from=builder-backend /app/apps/backend/dist ./dist
COPY --from=builder-backend /app/packages/types/dist ./node_modules/@lunaz/types/dist
COPY --from=builder-backend /app/packages/types/package.json ./node_modules/@lunaz/types/
COPY --from=builder-backend /app/packages/config/dist ./node_modules/@lunaz/config/dist
COPY --from=builder-backend /app/packages/config/package.json ./node_modules/@lunaz/config/

# Static assets: web at /, manage at /manage (Node serves via STATIC_DIR)
RUN mkdir -p /app/public
COPY --from=builder-web /app/apps/web/dist /app/public
COPY --from=builder-manage /app/apps/manage/dist /app/public/manage

ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/public

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
