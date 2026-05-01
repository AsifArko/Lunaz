FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

COPY tsconfig.base.json ./
COPY types ./types
COPY interfaces ./interfaces
COPY constants ./constants
COPY apps/backend ./apps/backend

# Increase Node heap for tsc on memory-constrained EC2 (avoids OOM/hang)
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build --workspace=backend

FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/apps/backend/dist ./dist

RUN chown -R expressjs:nodejs /app
USER expressjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/apps/backend/src/index.js"]
