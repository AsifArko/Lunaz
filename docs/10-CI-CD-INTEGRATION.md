# Lunaz — CI/CD Pipeline and Secure Development Workflow

> **For AWS EC2 deployment:** See [15-AWS-EC2-DEPLOYMENT-PIPELINE.md](./15-AWS-EC2-DEPLOYMENT-PIPELINE.md) and [EC2-SETUP.md](./EC2-SETUP.md) for the simplified master-only pipeline, build tags, and EC2 deployment.

## 1. Goals

- **Secure by default** — Enforce code reviews, branch protection, and secrets management.
- **Automated quality gates** — Lint, test, and build on every push and pull request.
- **Consistent deployments** — Automated staging and production deployments with rollback capability.
- **Environment isolation** — Separate configurations for development, staging, and production.
- **Auditability** — Track all deployments, changes, and access to sensitive resources.

## 2. Branch Strategy

### 2.1 Branch Structure

```
master (production)
  │
  ├── staging (pre-production testing)
  │     │
  │     └── feature/* (new features)
  │     └── fix/* (bug fixes)
  │     └── patch/* (urgent production fixes)
  │
  └── release/* (version releases)
```

### 2.2 Branch Rules

| Branch      | Protection                          | Merge Strategy                    | Deploy Target           |
| ----------- | ----------------------------------- | --------------------------------- | ----------------------- |
| `master`    | Protected, requires PR + 1 approval | Squash merge                      | Production              |
| `staging`   | Protected, requires PR              | Squash merge                      | Staging                 |
| `feature/*` | None                                | Rebase onto staging               | Preview (optional)      |
| `patch/*`   | None                                | Cherry-pick to master and staging | Production (fast-track) |
| `release/*` | None                                | Merge to master when ready        | Versioned release       |

### 2.3 Branch Protection Settings

For `master` and `staging` branches:

- **Require pull request reviews** — At least 1 approval required.
- **Dismiss stale reviews** — Re-review required after new commits.
- **Require status checks** — CI must pass before merge.
- **Require branches to be up to date** — Merge only if rebased on target.
- **Restrict force pushes** — Disabled for protected branches.
- **Require signed commits** — Recommended for production branch.

## 3. CI Pipeline

### 3.1 Triggers

| Event        | Branches/Tags                                                     | Actions                                   |
| ------------ | ----------------------------------------------------------------- | ----------------------------------------- |
| Push         | `master`, `staging`, `feature/*`, `fix/*`, `patch/*`, `release/*` | Lint, Test, Build                         |
| Pull Request | `master`, `staging`                                               | Lint, Test, Build, Security Scan          |
| Tag          | `v*`                                                              | Full Release (CI, Docker, GitHub Release) |
| Manual       | `release.yml` workflow dispatch                                   | Create versioned release                  |

### 3.2 Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CI Pipeline                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────────┐   │
│  │  Lint   │ →  │  Test   │ →  │  Build  │ →  │ Security Scan   │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────────────┘   │
│       │              │              │                  │              │
│       ▼              ▼              ▼                  ▼              │
│  - ESLint       - Unit Tests   - TypeScript     - Dependency audit   │
│  - Prettier     - Integration  - Docker images  - Secret detection   │
│  - TypeScript     Tests                         - SAST (optional)    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Lint Stage

```yaml
# Runs on all workspaces
lint:
  steps:
    - npm ci
    - npm run lint # ESLint across all workspaces
    - npm run format:check # Prettier check
    - npm run typecheck # TypeScript compilation check
```

**ESLint Rules (recommended):**

- `no-console` (warn in prod builds)
- `@typescript-eslint/no-explicit-any` (error)
- `@typescript-eslint/no-unused-vars` (error)
- Security-focused rules from `eslint-plugin-security`

### 3.4 Test Stage

```yaml
test:
  services:
    - mongodb:7
  steps:
    - npm ci
    - npm run test:unit # Unit tests (all workspaces)
    - npm run test:integration # Integration tests (backend)
  coverage:
    - minimum: 70% # Fail if below threshold
    - report: lcov # Upload to coverage service
```

**Test Categories:**

- **Unit tests** — Business logic, utilities, components.
- **Integration tests** — API endpoints with test database.
- **E2E tests** — Optional, run on staging after deploy.

### 3.5 Build Stage

```yaml
build:
  parallel:
    - build:backend
    - build:web
    - build:manage
  steps:
    - npm ci
    - npm run build --workspace=@lunaz/types
    - npm run build --workspace=@lunaz/ui
    - npm run build --workspace=backend
    - npm run build --workspace=web
    - npm run build --workspace=manage
```

### 3.6 Security Scan Stage

```yaml
security:
  steps:
    - npm audit --audit-level=high # Dependency vulnerabilities
    - npx secretlint "**/*" # Secret detection in code
    - trivy image <image> # Container vulnerability scan
```

**Security Checks:**

- **Dependency audit** — `npm audit` for known vulnerabilities.
- **Secret detection** — Scan for API keys, tokens, passwords in code.
- **Container scanning** — Trivy or similar for Docker image vulnerabilities.
- **SAST** — Optional static analysis (SonarQube, Semgrep).

## 4. CD Pipeline

### 4.1 Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CD Pipeline                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PR Merged to staging          PR Merged to master                   │
│        │                              │                               │
│        ▼                              ▼                               │
│  ┌───────────────┐            ┌───────────────┐                      │
│  │ Build Images  │            │ Build Images  │                      │
│  │ (staging tag) │            │ (prod tag)    │                      │
│  └───────┬───────┘            └───────┬───────┘                      │
│          │                            │                               │
│          ▼                            ▼                               │
│  ┌───────────────┐            ┌───────────────┐                      │
│  │ Push to       │            │ Push to       │                      │
│  │ Registry      │            │ Registry      │                      │
│  └───────┬───────┘            └───────┬───────┘                      │
│          │                            │                               │
│          ▼                            ▼                               │
│  ┌───────────────┐            ┌───────────────┐                      │
│  │ Deploy to     │            │ Manual        │                      │
│  │ Staging       │            │ Approval Gate │                      │
│  └───────┬───────┘            └───────┬───────┘                      │
│          │                            │                               │
│          ▼                            ▼                               │
│  ┌───────────────┐            ┌───────────────┐                      │
│  │ Run E2E       │            │ Deploy to     │                      │
│  │ Tests         │            │ Production    │                      │
│  └───────────────┘            └───────┬───────┘                      │
│                                       │                               │
│                                       ▼                               │
│                               ┌───────────────┐                      │
│                               │ Health Check  │                      │
│                               │ + Smoke Tests │                      │
│                               └───────────────┘                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Environments

| Environment | Purpose          | URL Pattern                     | Auto-Deploy                          |
| ----------- | ---------------- | ------------------------------- | ------------------------------------ |
| Development | Local dev        | `localhost:*`                   | Manual                               |
| Preview     | PR preview       | `pr-<number>.preview.lunaz.dev` | On PR (optional)                     |
| Staging     | Pre-prod testing | `staging.lunaz.dev`             | On merge to `staging`                |
| Production  | Live site        | `lunaz.dev`                     | On merge to `master` (with approval) |

### 4.3 Docker Image Tagging

```
Registry: ghcr.io/your-org/lunaz

Image naming:
  - ghcr.io/your-org/lunaz/backend:<tag>
  - ghcr.io/your-org/lunaz/web:<tag>
  - ghcr.io/your-org/lunaz/manage:<tag>

Tag strategy:
  - staging-<sha>        # Staging deployments
  - prod-<sha>           # Production deployments
  - v1.2.3               # Version releases
  - latest               # Latest production (optional)
```

### 4.4 Deployment Strategies

**Staging:**

- Rolling update with zero downtime.
- Auto-deploy on merge to `staging`.
- Run E2E tests post-deployment.

**Production:**

- Blue-green or rolling deployment.
- Manual approval gate before deploy.
- Health checks before traffic switch.
- Automatic rollback on health check failure.

## 5. GitHub Actions Workflows

### 5.1 Workflow Files

```
.github/
├── workflows/
│   ├── ci.yml              # Lint, test, build on push/PR
│   ├── deploy-staging.yml  # Deploy to staging
│   ├── deploy-prod.yml     # Deploy to production
│   ├── release.yml         # Version releases and tagging
│   └── security.yml        # Security scans (scheduled)
├── actions/
│   └── docker-build/       # Reusable action for building images
└── CODEOWNERS              # Required reviewers per path
```

### 5.2 CI Workflow (`ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [master, staging, 'feature/*', 'fix/*', 'patch/*']
  pull_request:
    branches: [master, staging]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017/lunaz-test
          JWT_SECRET: test-secret
      - uses: codecov/codecov-action@v4
        if: always()

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            apps/*/dist
            packages/*/dist

  security:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.pull_request.base.sha }}
          head: ${{ github.event.pull_request.head.sha }}

  docker:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/master' || github.ref == 'refs/heads/staging'
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        app: [backend, web, manage]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/${{ matrix.app }}/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/${{ matrix.app }}:${{ github.ref_name }}-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 5.3 Staging Deployment Workflow (`deploy-staging.yml`)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

concurrency:
  group: deploy-staging
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  IMAGE_TAG: staging-${{ github.sha }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Staging Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/lunaz
            docker compose -f docker-compose.staging.yml pull
            docker compose -f docker-compose.staging.yml up -d --remove-orphans
            docker system prune -f

      - name: Wait for healthy state
        run: |
          for i in {1..30}; do
            if curl -sf ${{ secrets.STAGING_URL }}/api/v1/health; then
              echo "Health check passed"
              exit 0
            fi
            echo "Waiting for service to be healthy..."
            sleep 10
          done
          echo "Health check failed"
          exit 1

      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ Staging deployment failed for ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.4 Production Deployment Workflow (`deploy-prod.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [master]
  workflow_dispatch:
    inputs:
      rollback_sha:
        description: 'SHA to rollback to (optional)'
        required: false

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  IMAGE_TAG: prod-${{ github.sha }}

jobs:
  approval:
    runs-on: ubuntu-latest
    environment: production-approval
    steps:
      - run: echo "Deployment approved"

  deploy:
    runs-on: ubuntu-latest
    needs: approval
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Set deployment SHA
        id: sha
        run: |
          if [ -n "${{ github.event.inputs.rollback_sha }}" ]; then
            echo "sha=${{ github.event.inputs.rollback_sha }}" >> $GITHUB_OUTPUT
            echo "Rolling back to ${{ github.event.inputs.rollback_sha }}"
          else
            echo "sha=${{ github.sha }}" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to Production
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/lunaz
            export IMAGE_TAG=prod-${{ steps.sha.outputs.sha }}
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker system prune -f

      - name: Health Check
        id: health
        run: |
          for i in {1..30}; do
            if curl -sf ${{ secrets.PROD_URL }}/api/v1/health; then
              echo "Health check passed"
              exit 0
            fi
            echo "Waiting for service to be healthy..."
            sleep 10
          done
          echo "Health check failed"
          exit 1

      - name: Rollback on failure
        if: failure() && steps.health.outcome == 'failure'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/lunaz
            docker compose -f docker-compose.prod.yml rollback

      - name: Create deployment record
        if: success()
        run: |
          gh api repos/${{ github.repository }}/deployments \
            -f ref=${{ steps.sha.outputs.sha }} \
            -f environment=production \
            -f auto_merge=false

      - name: Notify success
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Production deployment successful: ${{ steps.sha.outputs.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.5 Release Workflow (`release.yml`)

```yaml
name: Release

on:
  push:
    branches:
      - 'release/*'
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 1.2.3)'
        required: true
      prerelease:
        description: 'Mark as pre-release'
        required: false
        default: false

jobs:
  prepare:
    # Determine version from tag, branch, or input
    # Validate version format (X.Y.Z or X.Y.Z-suffix)

  ci:
    # Run full CI checks (lint, typecheck, test, build)

  docker:
    # Build and push versioned Docker images
    # Tags: v1.2.3, v1.2, v1, latest (for stable releases)

  release:
    # Create GitHub Release with changelog
    # Mark as pre-release if version contains suffix

  notify:
    # Send Slack notifications
```

**Release Process:**

1. **From release branch:**

   ```bash
   git checkout -b release/1.2.3
   # Make final adjustments, bump version
   git push origin release/1.2.3
   # CI runs, images tagged as pre-release
   ```

2. **Create version tag:**

   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   # Full release workflow runs
   # GitHub Release created
   # Images tagged as stable (latest)
   ```

3. **Manual release:**
   - Go to Actions → Release → Run workflow
   - Enter version (e.g., `1.2.3`)
   - Optionally mark as pre-release

**Docker Image Tags:**

- `v1.2.3` — Exact version
- `v1.2` — Minor version (latest patch)
- `v1` — Major version (latest minor)
- `latest` — Most recent stable release

### 5.6 Security Scan Workflow (`security.yml`)

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday at 6 AM UTC
  pull_request:
    branches: [master]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=moderate
        continue-on-error: true
      - uses: actions/dependency-review-action@v4
        if: github.event_name == 'pull_request'

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          extra_args: --only-verified

  container-scan:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [backend, web, manage]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/${{ matrix.app }}/Dockerfile
          push: false
          tags: lunaz/${{ matrix.app }}:scan
          load: true
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: lunaz/${{ matrix.app }}:scan
          format: sarif
          output: trivy-${{ matrix.app }}.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-${{ matrix.app }}.sarif
```

## 6. Secrets Management

### 6.1 Secret Categories

| Category       | Examples                                | Storage                              |
| -------------- | --------------------------------------- | ------------------------------------ |
| CI/CD          | `STAGING_SSH_KEY`, `PROD_SSH_KEY`       | GitHub Secrets                       |
| Application    | `JWT_SECRET`, `SESSION_SECRET`          | GitHub Secrets → Environment         |
| Infrastructure | `AWS_ACCESS_KEY_ID`, `DATABASE_URL`     | GitHub Secrets / AWS Secrets Manager |
| Third-party    | `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY` | GitHub Secrets / Vault               |

### 6.2 GitHub Secrets Structure

```
Repository Secrets (shared):
  - SLACK_WEBHOOK
  - CODECOV_TOKEN

Environment: staging
  - STAGING_HOST
  - STAGING_USER
  - STAGING_SSH_KEY
  - STAGING_URL
  - MONGODB_URI
  - JWT_SECRET
  - S3_BUCKET
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY

Environment: production
  - PROD_HOST
  - PROD_USER
  - PROD_SSH_KEY
  - PROD_URL
  - MONGODB_URI
  - JWT_SECRET
  - S3_BUCKET
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY

Environment: production-approval
  - (No secrets, used for manual approval gate)
```

### 6.3 Secret Rotation

- **SSH Keys** — Rotate every 90 days; use separate keys per environment.
- **JWT Secret** — Rotate on suspected compromise; requires coordinated deployment.
- **API Keys** — Rotate per provider requirements; use short-lived tokens where possible.
- **Database credentials** — Use IAM-based auth where available; rotate passwords quarterly.

### 6.4 Secret Detection Prevention

**Pre-commit hook (`.husky/pre-commit`):**

```bash
#!/bin/sh
npx secretlint "**/*"
```

**`.secretlintrc.json`:**

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    },
    {
      "id": "@secretlint/secretlint-rule-aws",
      "options": {
        "allows": []
      }
    }
  ]
}
```

## 7. CODEOWNERS

```
# .github/CODEOWNERS

# Default owners for everything
* @your-org/lunaz-team

# Backend requires backend team review
/apps/backend/ @your-org/backend-team

# Frontend requires frontend team review
/apps/web/ @your-org/frontend-team
/apps/manage/ @your-org/frontend-team
/packages/ui/ @your-org/frontend-team

# Infrastructure changes require DevOps review
/.github/ @your-org/devops-team
/docker-compose*.yml @your-org/devops-team
**/Dockerfile @your-org/devops-team

# Security-sensitive files require security review
/apps/backend/src/middleware/auth.ts @your-org/security-team
/apps/backend/src/lib/jwt.ts @your-org/security-team
```

## 8. Required Repository Settings

### 8.1 Branch Protection Rules

**For `master`:**

```yaml
protection_rules:
  required_status_checks:
    strict: true
    contexts:
      - lint
      - test
      - build
      - security
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  restrictions:
    users: []
    teams: [devops-team]
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false
```

**For `staging`:**

```yaml
protection_rules:
  required_status_checks:
    strict: true
    contexts:
      - lint
      - test
      - build
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  enforce_admins: false
  allow_force_pushes: false
```

### 8.2 GitHub Environments

Create the following environments in GitHub Settings → Environments:

1. **staging**
   - No protection rules (auto-deploy on merge)
   - Environment secrets for staging infrastructure

2. **production-approval**
   - Required reviewers: DevOps team or designated approvers
   - Wait timer: 0-60 minutes (optional)

3. **production**
   - Deployment branches: `master` only
   - Environment secrets for production infrastructure

## 9. Rollback Procedures

### 9.1 Automatic Rollback

Production deployments automatically rollback if:

- Health check fails after 5 minutes
- Error rate exceeds 5% within 10 minutes of deploy

### 9.2 Manual Rollback

**Via GitHub Actions:**

1. Go to Actions → Deploy to Production
2. Click "Run workflow"
3. Enter the SHA to rollback to in `rollback_sha` input
4. Click "Run workflow"

**Via CLI:**

```bash
# Find the last good deployment
gh run list --workflow=deploy-prod.yml

# Trigger rollback
gh workflow run deploy-prod.yml -f rollback_sha=<sha>
```

**Via SSH (emergency):**

```bash
ssh deploy@prod-server
cd /opt/lunaz
export IMAGE_TAG=prod-<last-good-sha>
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 9.3 Rollback Checklist

- [ ] Identify the issue and last known good state
- [ ] Notify team via Slack/incident channel
- [ ] Execute rollback via preferred method
- [ ] Verify health check passes
- [ ] Monitor error rates for 15 minutes
- [ ] Document incident and root cause

## 10. Monitoring and Alerts

### 10.1 Deployment Notifications

- **Slack** — Notify on deploy start, success, and failure.
- **GitHub Deployments** — Track deployment history in repository.
- **Status page** — Update external status page for production deploys.

### 10.2 CI/CD Metrics

Track and alert on:

- Pipeline duration (target: <10 minutes)
- Test flakiness rate (target: <2%)
- Deployment success rate (target: >99%)
- Time from merge to production (target: <30 minutes)

### 10.3 Post-Deployment Checks

After every production deployment, monitor:

- Error rate (should not spike >1%)
- Response time p95 (should not increase >20%)
- Server resource usage
- Key business metrics

## 11. Local Development Commands

```bash
# Run full CI locally before pushing
make ci

# Run specific stages
npm run lint
npm run test
npm run build

# Build Docker images locally
docker compose build

# Run production-like stack locally
docker compose -f docker-compose.prod.yml up
```

## 12. Implementation Checklist

### Phase 1: Repository Setup

- [ ] Create `.github/workflows/` directory
- [ ] Add `ci.yml` workflow
- [ ] Configure branch protection for `master` and `staging`
- [ ] Set up CODEOWNERS file
- [ ] Add pre-commit hooks for secret detection

### Phase 2: CI Pipeline

- [ ] Implement lint job with ESLint and Prettier
- [ ] Implement test job with MongoDB service
- [ ] Implement build job for all workspaces
- [ ] Add security scanning job
- [ ] Configure artifact caching

### Phase 3: Docker and Registry

- [ ] Set up GitHub Container Registry (ghcr.io)
- [ ] Configure Docker build caching
- [ ] Implement image tagging strategy
- [ ] Add container vulnerability scanning

### Phase 4: CD Pipeline

- [ ] Create GitHub environments (staging, production)
- [ ] Configure environment secrets
- [ ] Implement staging deployment workflow
- [ ] Implement production deployment workflow with approval gate
- [ ] Add health checks and automatic rollback

### Phase 5: Monitoring and Alerts

- [ ] Set up Slack notifications
- [ ] Configure deployment tracking
- [ ] Add post-deployment smoke tests
- [ ] Document rollback procedures

## 13. Summary

- **Branches:** `master` (production), `staging`, `feature/*` — all protected with required reviews.
- **CI:** Lint → Test → Build → Security Scan on every push and PR.
- **CD:** Auto-deploy to staging on merge; manual approval for production.
- **Secrets:** GitHub Secrets per environment; never in code; rotate regularly.
- **Rollback:** Automatic on health check failure; manual via workflow dispatch.
- **Security:** Secret detection pre-commit, dependency audits, container scanning.
