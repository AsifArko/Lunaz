FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:4000/api/v1
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

COPY tsconfig.base.json ./
COPY types ./types
COPY interfaces ./interfaces
COPY constants ./constants
COPY apps/web ./apps/web

RUN npm run build --workspace=web

FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

COPY apps/web/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
