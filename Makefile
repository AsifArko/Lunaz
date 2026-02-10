# ============================================================================
# Lunaz — Makefile
# ============================================================================
# Common commands for development and deployment
# Usage: make <target>
# ============================================================================

.PHONY: help install dev build clean docker-build docker-up docker-down docker-logs docker-clean seed-admin seed-products seed-data seed-all lint format typecheck test ci security-scan

# Default target
help:
	@echo "Lunaz — Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    make install     Install all dependencies"
	@echo "    make dev         Start development servers (backend + web + manage)"
	@echo "    make dev-backend Start backend development server"
	@echo "    make dev-web     Start web development server"
	@echo "    make dev-manage  Start manage development server"
	@echo "    make build       Build all packages and apps"
	@echo "    make clean       Remove node_modules and dist folders"
	@echo ""
	@echo "  CI/CD:"
	@echo "    make lint        Run ESLint on all workspaces"
	@echo "    make format      Format code with Prettier"
	@echo "    make format-check Check code formatting"
	@echo "    make typecheck   Run TypeScript type checking"
	@echo "    make test        Run all tests"
	@echo "    make ci          Run full CI pipeline locally"
	@echo "    make security-scan Run security scans"
	@echo ""
	@echo "  Database Seeding:"
	@echo "    make seed-admin     Create an admin user"
	@echo "    make seed-products  Seed categories and products"
	@echo "    make seed-data      Seed customers, orders, transactions"
	@echo "    make seed-all       Run all seed scripts"
	@echo ""
	@echo "  Docker Seeding:"
	@echo "    make docker-seed-admin     Create admin in Docker"
	@echo "    make docker-seed-products  Seed products in Docker"
	@echo "    make docker-seed-data      Seed data in Docker"
	@echo "    make docker-seed-all       Run all seeds in Docker"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build    Build all Docker images"
	@echo "    make docker-up       Start all containers (docker compose up)"
	@echo "    make docker-up-db    Start only MongoDB + MinIO (for npm run dev:*)"
	@echo "    make docker-down     Stop all containers"
	@echo "    make docker-logs     View container logs"
	@echo "    make docker-clean    Remove containers, images, and volumes"
	@echo "    make docker-restart  Restart all containers"
	@echo ""
	@echo "  Production:"
	@echo "    make prod-build  Build production images"
	@echo "    make prod-up     Start production containers"
	@echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

dev-backend:
	npm run dev:backend

dev-web:
	npm run dev:web

dev-manage:
	npm run dev:manage

build:
	npm run build

clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/dist
	rm -rf packages/*/dist

# ─────────────────────────────────────────────────────────────────────────────
# CI/CD
# ─────────────────────────────────────────────────────────────────────────────

# Run ESLint on all workspaces
lint:
	npm run lint

# Fix ESLint issues
lint-fix:
	npm run lint:fix

# Format code with Prettier
format:
	npm run format

# Check code formatting
format-check:
	npm run format:check

# Run TypeScript type checking
typecheck:
	npm run typecheck

# Run all tests
test:
	npm run test

# Run full CI pipeline locally
ci:
	@echo "Running CI pipeline..."
	@echo ""
	@echo "Step 1/4: Linting..."
	npm run lint
	@echo ""
	@echo "Step 2/4: Type checking..."
	npm run typecheck
	@echo ""
	@echo "Step 3/4: Running tests..."
	npm run test
	@echo ""
	@echo "Step 4/4: Building..."
	npm run build
	@echo ""
	@echo "✓ CI pipeline completed successfully!"

# Run security scans
security-scan:
	@echo "Running security scans..."
	npm audit --audit-level=high || true
	@echo ""
	@echo "Scanning for secrets..."
	npx secretlint "**/*" || true
	@echo ""
	@echo "✓ Security scan completed!"

# Setup husky pre-commit hooks
setup-hooks:
	npm run prepare
	npx husky add .husky/pre-commit "npm run lint && npm run format:check"
	@echo "✓ Git hooks configured!"

# ─────────────────────────────────────────────────────────────────────────────
# Database / Seeding
# ─────────────────────────────────────────────────────────────────────────────

# Create admin user (set MONGODB_URI, optionally ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
seed-admin:
	@if [ -z "$$MONGODB_URI" ]; then \
		echo "Usage: MONGODB_URI=mongodb://localhost:27017/lunaz make seed-admin"; \
		echo "Optional: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME"; \
		exit 1; \
	fi
	npm run seed:admin --workspace=backend

# Seed products and categories
seed-products:
	@if [ -z "$$MONGODB_URI" ]; then \
		echo "Usage: MONGODB_URI=mongodb://localhost:27017/lunaz make seed-products"; \
		exit 1; \
	fi
	npm run seed:products --workspace=backend

# Seed customers, orders, and transactions
seed-data:
	@if [ -z "$$MONGODB_URI" ]; then \
		echo "Usage: MONGODB_URI=mongodb://localhost:27017/lunaz make seed-data"; \
		exit 1; \
	fi
	npm run seed:data --workspace=backend

# Seed everything (admin, products, customers, orders, transactions)
seed-all:
	@if [ -z "$$MONGODB_URI" ]; then \
		echo "Usage: MONGODB_URI=mongodb://localhost:27017/lunaz make seed-all"; \
		exit 1; \
	fi
	npm run seed:all --workspace=backend

# Seed admin in Docker environment
docker-seed-admin:
	docker compose exec backend npm run seed:admin

# Seed products in Docker environment
docker-seed-products:
	docker compose exec backend npm run seed:products

# Seed data (customers, orders, transactions) in Docker environment
docker-seed-data:
	docker compose exec backend npm run seed:data

# Seed everything in Docker environment
docker-seed-all:
	docker compose exec backend npm run seed:all

# ─────────────────────────────────────────────────────────────────────────────
# Docker (Development)
# ─────────────────────────────────────────────────────────────────────────────

docker-build:
	docker compose build

docker-up:
	docker compose up -d

# Start only MongoDB and MinIO (for local dev with npm run dev:backend, dev:web, dev:manage)
docker-up-db:
	docker compose up -d mongodb minio minio-init

docker-up-build:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-logs-backend:
	docker compose logs -f backend

docker-logs-web:
	docker compose logs -f web

docker-logs-manage:
	docker compose logs -f manage

docker-restart:
	docker compose restart

docker-clean:
	docker compose down -v --rmi all --remove-orphans

docker-ps:
	docker compose ps

# ─────────────────────────────────────────────────────────────────────────────
# Docker (Production)
# ─────────────────────────────────────────────────────────────────────────────

prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# ─────────────────────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────────────────────

db-shell:
	docker compose exec mongodb mongosh lunaz

# ─────────────────────────────────────────────────────────────────────────────
# MinIO
# ─────────────────────────────────────────────────────────────────────────────

minio-console:
	@echo "Opening MinIO Console at http://localhost:9001"
	@echo "Credentials: minioadmin / minioadmin"
	@open http://localhost:9001 2>/dev/null || xdg-open http://localhost:9001 2>/dev/null || echo "Visit http://localhost:9001"
