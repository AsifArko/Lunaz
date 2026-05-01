FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/

RUN npm ci

FROM node:20-alpine AS builder-backend
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/apps/backend/package.json ./apps/backend/

COPY tsconfig.base.json ./
COPY types ./types
COPY interfaces ./interfaces
COPY constants ./constants
COPY apps/backend ./apps/backend

RUN npm run build --workspace=backend

FROM node:20-alpine AS builder-web
WORKDIR /app

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/apps/web/package.json ./apps/web/

COPY tsconfig.base.json ./
COPY types ./types
COPY apps/web ./apps/web

RUN npm run build --workspace=web

FROM node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder-backend /app/apps/backend/dist ./dist

RUN mkdir -p /app/public
COPY --from=builder-web /app/apps/web/dist /app/public

ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/public

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/apps/backend/src/index.js"]
