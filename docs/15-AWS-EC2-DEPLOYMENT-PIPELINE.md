# Lunaz — AWS EC2 Deployment Pipeline & Build System

**Document Number:** 15  
**Status:** Implementation Plan  
**Last Updated:** 2025-02-13

This document describes the complete GitHub Actions pipeline, build tagging, code quality tooling, and AWS EC2 deployment strategy for the Lunaz e-commerce platform. It serves as the implementation blueprint before any code changes.

---

## Table of Contents

1. [Overview & Design Principles](#1-overview--design-principles)
2. [Application Architecture & Port Mapping](#2-application-architecture--port-mapping)
3. [Branch Strategy & Workflow](#3-branch-strategy--workflow)
4. [Code Quality Tooling (ESLint, Prettier, Husky)](#4-code-quality-tooling-eslint-prettier-husky)
5. [GitHub Actions CI Pipeline](#5-github-actions-ci-pipeline)
6. [Build Tags & Versioning](#6-build-tags--versioning)
7. [Docker & Image Registry](#7-docker--image-registry)
8. [AWS EC2 Deployment](#8-aws-ec2-deployment)
9. [Codebase Deployment Optimizations](#9-codebase-deployment-optimizations)
10. [Environment Variables & Secrets](#10-environment-variables--secrets)
11. [Implementation Phases & Checklist](#11-implementation-phases--checklist)

---

## 1. Overview & Design Principles

### 1.1 Goals

- **Single source of truth:** All changes flow via Pull Requests to `master`.
- **Automated quality gates:** ESLint, Prettier, and pre-commit hooks enforce consistency.
- **Build on merge:** When a PR is merged to `master`, the pipeline builds, tags, and deploys.
- **Traceability:** Every deployment has a unique release tag (e.g. `v2026.02.17-abc1234`).
- **EC2-native:** Deploy to a single EC2 instance (or multiple) using Docker Compose.
- **No route hacks:** Web, Backend, and Manage run on distinct ports (3000, 4000, 3001).

### 1.2 Simplifications vs. Previous Setup

| Previous (Fly.io)                | New (EC2)                        |
| -------------------------------- | -------------------------------- |
| Manage app at `host:port/manage` | Manage at `host:3001` (own port) |
| Complex routing/proxy config     | Simple port mapping              |
| Fly-specific config              | Standard Docker Compose          |

---

## 2. Application Architecture & Port Mapping

### 2.1 Port Layout

| Service     | Port (Host) | Port (Container) | Purpose                    |
| ----------- | ----------- | ---------------- | -------------------------- |
| **Web**     | 3000        | 80               | Customer-facing storefront |
| **Backend** | 4000        | 4000             | REST API                   |
| **Manage**  | 3001        | 80               | Admin dashboard / CMS      |

### 2.2 Access URLs (Production)

```
https://your-domain.com          → Web (port 3000, via reverse proxy)
https://api.your-domain.com      → Backend (port 4000)
https://manage.your-domain.com   → Manage (port 3001)
```

Or, if using a single domain with path-based routing (optional):

```
https://your-domain.com/          → Web
https://your-domain.com/api/     → Backend (proxy)
https://your-domain.com/manage/  → Manage
```

**Recommendation:** Use subdomains (`api.`, `manage.`) for clarity. No special route hacks needed—each app listens on its own port.

---

## 3. Branch Strategy & Workflow

### 3.1 Branch Model

```
master (protected)
  │
  └── feature/*  (PR → master)
  └── fix/*      (PR → master)
  └── task/*     (PR → master)
```

- **All work** is done in feature/fix/task branches.
- **All merges** go to `master` via Pull Request.
- **No `staging` branch** in this simplified model (optional: add later).
- **No direct pushes** to `master`; branch protection enforces PR + CI pass.

### 3.2 Pipeline Triggers

| Event               | Branches      | Actions                                      |
| ------------------- | ------------- | -------------------------------------------- |
| **Pull Request**    | → `master`    | Lint, Format check, Typecheck, Test, Build   |
| **Push to master**  | `master`      | Same as PR + Docker build + Tag + Deploy     |
| **Merge to master** | (after merge) | Full pipeline: CI → Build → Tag → Deploy EC2 |

### 3.3 GitHub Branch Protection (master)

- Require pull request before merging
- Require at least 1 approval
- Require status checks: `lint`, `test`, `build`
- Require branches to be up to date
- Do not allow force pushes
- Do not allow deletions

---

## 4. Code Quality Tooling (ESLint, Prettier, Husky)

### 4.1 ESLint

**Purpose:** Catch bugs, enforce style, and maintain consistency.

**Configuration:**

- Root `.eslintrc.json` with TypeScript, React, React Hooks support
- Shared config for `apps/backend`, `apps/web`, `apps/manage`
- Rules: `no-console` (warn), `@typescript-eslint/no-explicit-any` (warn), `@typescript-eslint/no-unused-vars` (warn)

**Scripts:**

```json
"lint": "npm run lint --workspaces --if-present",
"lint:fix": "npm run lint:fix --workspaces --if-present"
```

**Per-workspace:**

- `backend`: `eslint src --ext .ts`
- `web`, `manage`: `eslint . --ext ts,tsx`

### 4.2 Prettier

**Purpose:** Consistent formatting across the codebase.

**Configuration:** `.prettierrc` (already exists)

- `semi: true`, `singleQuote: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: "es5"`, `endOfLine: "lf"`

**Scripts:**

```json
"format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
"format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
```

**Ignore:** `node_modules`, `dist`, `build`, `*.min.js`, etc. via `.prettierignore`

### 4.3 Husky & Pre-commit Hooks

**Purpose:** Run checks before every commit to prevent bad code from being pushed.

**Hooks:**

| Hook         | Commands                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| `pre-commit` | `npm run lint`, `npm run format:check`, optionally `npx secretlint "**/*"` |

**Setup:**

```bash
npm run prepare   # Installs husky
npx husky add .husky/pre-commit "npm run lint && npm run format:check"
```

**Optional:** Add `lint-staged` to run only on staged files for faster commits:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

### 4.4 Implementation Checklist (Code Quality)

- [ ] Ensure `.eslintrc.json` covers all workspaces
- [ ] Add `.prettierignore` if not present
- [ ] Add `lint-staged` for faster pre-commit (optional)
- [ ] Update `.husky/pre-commit` to run `lint` + `format:check`
- [ ] Add `secretlint` to pre-commit (optional, for secret detection)
- [ ] Ensure `npm run ci` runs: lint → typecheck → test → build

---

## 5. GitHub Actions CI Pipeline

### 5.1 Workflow: `ci.yml`

**Triggers:**

- `push` to `master`, `feature/*`, `fix/*`, `task/*`
- `pull_request` to `master`

**Jobs (in order):**

1. **lint** — ESLint, Prettier check, TypeScript typecheck
2. **test** — Unit + integration tests (MongoDB service)
3. **build** — Build all workspaces
4. **security** — `npm audit`, TruffleHog (PR only)
5. **docker** — Build and push images (master only, after merge)

### 5.2 Workflow: `deploy-ec2.yml` (New)

**Triggers:**

- `push` to `master` (after merge)
- `workflow_dispatch` (manual deploy / rollback)

**Jobs:**

1. **build** — Build Docker images, push to GHCR with build tag
2. **tag** — Create Git tag `v<YYYY.MM.DD>-<short-sha>` (e.g. `v2026.02.17-abc1234`), GitHub Release, and Docker images use same tag
3. **deploy** — SSH to EC2, pull images, run `docker compose up`
4. **health** — Verify `/health` and frontend endpoints
5. **rollback** — On failure, revert to previous image (optional)

### 5.3 Concurrency

- `concurrency: group: ci-${{ github.ref }}` — Cancel in-progress runs for same ref
- `deploy-ec2`: `cancel-in-progress: false` — Do not cancel deployments

---

## 6. Build Tags & Versioning

### 6.1 Tag Format

| Tag Type    | Example               | When Created                                     |
| ----------- | --------------------- | ------------------------------------------------ |
| Release tag | `v2026.02.17-abc1234` | Same for Git, Docker, GitHub Release, deployment |
| Docker tag  | `v2026.02.17-abc1234` | Same as release tag                              |
| Latest      | `latest`              | Latest successful master build                   |

### 6.2 Tag Creation

After a successful merge to `master`:

1. CI runs and passes
2. Docker images are built and pushed to `ghcr.io/<org>/lunaz/<app>:<release-tag>`
3. Git tag `v<YYYY.MM.DD>-<short-sha>` is created, pushed, and a GitHub Release is created; Docker images and deployment use the same tag
4. Deploy workflow resolves the tag for the commit and pulls images with that tag

### 6.3 Image Naming (GHCR)

```
ghcr.io/<github-org>/lunaz/backend:<release-tag>
ghcr.io/<github-org>/lunaz/web:<release-tag>
ghcr.io/<github-org>/lunaz/nginx:<release-tag>
```

---

## 7. Docker & Image Registry

### 7.1 Registry

- **GitHub Container Registry (GHCR):** `ghcr.io`
- **Authentication:** `GITHUB_TOKEN` (automatic in Actions)
- **Package visibility:** Private or public per org settings

### 7.2 Docker Compose for Production

**Key changes for EC2:**

1. **Use pre-built images** from GHCR instead of building on the server
2. **No `build:` block** in production compose; use `image:` only
3. **Environment variables** loaded from `.env` or GitHub Secrets

**Example `docker-compose.ec2.yml`:**

```yaml
services:
  backend:
    image: ghcr.io/<org>/lunaz/backend:${TAG}
    # ... env, ports, healthcheck

  web:
    image: ghcr.io/<org>/lunaz/web:${TAG}
    # ...

  manage:
    image: ghcr.io/<org>/lunaz/manage:${TAG}
    # ...
```

### 7.3 EC2 Login to GHCR

The EC2 instance must authenticate to GHCR to pull private images:

- **Option A:** GitHub Actions deploys via SSH; the deploy step runs `docker compose pull` (images are public or PAT is used)
- **Option B:** Use a GitHub PAT or `GITHUB_TOKEN` stored as a secret; run `echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin` before pull

---

## 8. AWS EC2 Deployment

### 8.1 EC2 Setup (One-time)

1. **Launch EC2 instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Storage: 20 GB+ SSD
   - Security group: Allow SSH (22), HTTP (80), HTTPS (443), and app ports (3000, 3001, 4000) as needed

2. **Install Docker & Docker Compose**

   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker ubuntu
   ```

3. **Create app directory**

   ```bash
   sudo mkdir -p /opt/lunaz
   sudo chown ubuntu:ubuntu /opt/lunaz
   ```

4. **Configure GitHub Actions secrets** (see Section 10)

### 8.2 Deploy Flow

1. Developer merges PR to `master`
2. CI runs (lint, test, build)
3. Docker job builds and pushes images to GHCR with tag `<release-tag>`
4. Deploy workflow triggers
5. Workflow SSHs to EC2, sets `TAG=<release-tag>`, runs:
   ```bash
   cd /opt/lunaz
   docker compose -f docker-compose.ec2.yml pull
   docker compose -f docker-compose.ec2.yml up -d --remove-orphans
   docker system prune -f
   ```
6. Health check runs against backend and frontends
7. On success: deployment recorded; on failure: optional rollback

### 8.3 Reverse Proxy (Nginx / Caddy)

For HTTPS and single-domain access, run Nginx or Caddy on the EC2 host:

- Proxy `your-domain.com` → `localhost:3000` (Web)
- Proxy `api.your-domain.com` → `localhost:4000` (Backend)
- Proxy `manage.your-domain.com` → `localhost:3001` (Manage)

Or use AWS Application Load Balancer (ALB) with target groups for each port.

### 8.4 MongoDB

- **Production:** Use MongoDB Atlas or DocumentDB; set `MONGODB_URI` in environment
- **Do not** run MongoDB in Docker on EC2 for production (use managed DB)

---

## 9. Codebase Deployment Optimizations

### 9.1 Dockerfile Optimizations

- [ ] **Multi-stage builds** — Already in place; ensure minimal final image
- [ ] **Layer caching** — Copy `package*.json` first, run `npm ci`, then copy source
- [ ] **Non-root user** — Backend already uses `expressjs` user
- [ ] **Health checks** — All services have `HEALTHCHECK` in Dockerfile

### 9.2 Frontend Build Args

- [ ] **VITE_API_URL** — Must be set at build time for Web and Manage
- [ ] **VITE_GOOGLE_CLIENT_ID** — For OAuth (if used)
- [ ] Ensure CI passes correct `VITE_API_URL` when building Docker images (e.g. `https://api.your-domain.com/api/v1`)

### 9.3 Backend Production Settings

- [ ] `NODE_ENV=production`
- [ ] No `console.log` in hot paths (ESLint warns)
- [ ] CORS: `FRONTEND_WEB_URL`, `FRONTEND_MANAGE_URL` set to production URLs
- [ ] `API_URL` for payment callbacks and OAuth redirects

### 9.4 Docker Compose for EC2

- [ ] Create `docker-compose.ec2.yml` that uses `image:` only (no `build:`)
- [ ] Use `TAG` env var for image tag
- [ ] Ensure `VITE_API_URL` is baked into Web/Manage images at CI build time
- [ ] Map ports: 3000 (web), 4000 (backend), 3001 (manage)

### 9.5 Remove Fly.io Artifacts

- [ ] Remove any `fly.toml`, `nginx-fly*.conf` if present
- [ ] Remove route-hack logic (e.g. `/manage` path routing) from configs
- [ ] Update docs to reflect EC2 deployment only

---

## 10. Environment Variables & Secrets

### 10.1 GitHub Secrets (Repository)

| Secret            | Description                           | Used By    |
| ----------------- | ------------------------------------- | ---------- |
| `EC2_HOST`        | EC2 public IP or hostname             | deploy-ec2 |
| `EC2_USER`        | SSH user (e.g. `ubuntu`)              | deploy-ec2 |
| `EC2_SSH_KEY`     | Private SSH key for EC2               | deploy-ec2 |
| `GHCR_TOKEN`      | PAT for pulling images (if private)   | deploy-ec2 |
| `PROD_URL`        | Production Web URL (for health check) | deploy-ec2 |
| `PROD_API_URL`    | Production API URL                    | deploy-ec2 |
| `PROD_MANAGE_URL` | Production Manage URL                 | deploy-ec2 |

### 10.2 EC2 Environment (.env on server)

Create `/opt/lunaz/.env` on EC2 (or use a secrets manager):

```
NODE_ENV=production
TAG=<set by deploy script>

# MongoDB (Atlas or DocumentDB)
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# S3
S3_BUCKET=...
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# CORS
FRONTEND_WEB_URL=https://your-domain.com
FRONTEND_MANAGE_URL=https://manage.your-domain.com
API_URL=https://api.your-domain.com

# Frontend build-time (baked in at CI)
# VITE_API_URL=https://api.your-domain.com/api/v1
```

### 10.3 Build-Time Variables (CI)

When building Web and Manage images in CI, pass:

- `VITE_API_URL` = production API URL (e.g. `https://api.your-domain.com/api/v1`)
- `VITE_GOOGLE_CLIENT_ID` = Google OAuth client ID (if used)

---

## 11. Implementation Phases & Checklist

### Phase 1: Code Quality & Hooks

1. [ ] Verify ESLint config for all workspaces
2. [ ] Add `.prettierignore` if missing
3. [ ] Add `lint-staged` (optional)
4. [ ] Update `.husky/pre-commit` with `lint` + `format:check`
5. [ ] Run `make setup-hooks` and test pre-commit

### Phase 2: CI Pipeline Updates

1. [ ] Simplify `ci.yml` triggers to PR/push to `master` only (remove staging if desired)
2. [ ] Ensure Docker job runs only on `master` after merge
3. [ ] Add release tag creation step (Git tag `v<YYYY.MM.DD>-<short-sha>` + GitHub Release + Docker)
4. [ ] Use GHCR image names: `ghcr.io/<org>/lunaz/<app>:<release-tag>`
5. [ ] Pass `VITE_API_URL` as build arg when building Web/Manage images in CI

### Phase 3: EC2 Deployment Workflow

1. [ ] Create `docker-compose.ec2.yml` (image-only, no build)
2. [ ] Create or update `deploy-ec2.yml` workflow
3. [ ] Configure GitHub Secrets for EC2
4. [ ] Add health check step
5. [ ] Add optional rollback step
6. [ ] Remove or archive `deploy-prod.yml` if replacing with EC2-specific workflow

### Phase 4: Codebase Optimization

1. [ ] Update `docker-compose.prod.yml` or create `docker-compose.ec2.yml` for GHCR images
2. [ ] Ensure Dockerfiles use correct build args
3. [ ] Remove Fly.io / nginx route-hack configs
4. [ ] Update `.env.example` with production variable descriptions
5. [ ] Document EC2 setup in `docs/LOCAL-DEPLOYMENT.md` or new `docs/EC2-SETUP.md`

### Phase 5: Documentation & Validation

1. [ ] Update `docs/10-CI-CD-INTEGRATION.md` to reference this document
2. [ ] Add `docs/EC2-SETUP.md` with step-by-step EC2 provisioning
3. [ ] Test full flow: PR → merge → build → tag → deploy
4. [ ] Validate health checks and smoke tests

---

## Summary

| Component        | Implementation                                                                    |
| ---------------- | --------------------------------------------------------------------------------- |
| **Branch model** | PR → master only                                                                  |
| **Release tag**  | `v<YYYY.MM.DD>-<short-sha>` — unified for Git, Docker, GitHub Release, deployment |
| **Docker**       | GHCR, tag = short SHA                                                             |
| **Deploy**       | SSH to EC2, `docker compose pull` + `up -d`                                       |
| **Ports**        | Web 3000, Backend 4000, Manage 3001                                               |
| **Quality**      | ESLint, Prettier, Husky pre-commit                                                |
| **Secrets**      | GitHub Secrets + EC2 `.env`                                                       |

This document should be followed in order during implementation. Each phase builds on the previous one.
