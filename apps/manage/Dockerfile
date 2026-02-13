# ============================================================================
# Lunaz Manage (Admin) — Multi-stage Docker build (AWS ECS compatible)
# ============================================================================
# Build context: monorepo root (.)
# Usage: docker build -f apps/manage/Dockerfile --build-arg VITE_API_URL=http://api.example.com .
# ============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files for better layer caching
COPY package.json package-lock.json ./
COPY apps/manage/package.json ./apps/manage/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN npm ci

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments (passed at build time)
ARG VITE_API_URL=http://localhost:4000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

# Copy source code
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY apps/manage ./apps/manage

# Build shared packages and manage app
RUN npm run build --workspace=@lunaz/types && \
    npm run build --workspace=@lunaz/ui && \
    npm run build --workspace=manage

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Production (serve static files)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install serve for static file serving (AWS ECS compatible)
RUN npm install -g serve

# Copy built static files
COPY --from=builder /app/apps/manage/dist ./dist

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

# Serve static files on port 80
CMD ["serve", "-s", "/app/dist", "-l", "80"]
