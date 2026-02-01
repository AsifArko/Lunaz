# ============================================================================
# Lunaz Backend — Multi-stage Docker build
# ============================================================================
# Build context: monorepo root (.)
# Usage: docker build -f apps/backend/Dockerfile .
# ============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:25-alpine AS deps
WORKDIR /app

# Copy package files for better layer caching
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:25-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

# Copy source code
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY apps/backend ./apps/backend

# Build shared packages and backend
RUN npm run build --workspace=@lunaz/types && \
    npm run build --workspace=@lunaz/config && \
    npm run build --workspace=backend

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Production
# ─────────────────────────────────────────────────────────────────────────────
FROM node:25-alpine AS production
WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Set production environment
ENV NODE_ENV=production

# Copy package files for production dependencies
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/packages/types/dist ./node_modules/@lunaz/types/dist
COPY --from=builder /app/packages/types/package.json ./node_modules/@lunaz/types/
COPY --from=builder /app/packages/config/dist ./node_modules/@lunaz/config/dist
COPY --from=builder /app/packages/config/package.json ./node_modules/@lunaz/config/

# Change ownership to non-root user
RUN chown -R expressjs:nodejs /app
USER expressjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:4000/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
