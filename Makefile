# ============================================================================
# Lunaz — Makefile
# ============================================================================
# Common commands for development and deployment
# Usage: make <target>
# ============================================================================

.PHONY: help install dev build clean docker-build docker-up docker-down docker-logs docker-clean seed-admin

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
	@echo "  Database:"
	@echo "    make seed-admin  Create an admin user (requires MONGODB_URI)"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build    Build all Docker images"
	@echo "    make docker-up       Start all containers (docker compose up)"
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

# Seed admin in Docker environment
docker-seed-admin:
	docker compose exec backend npm run seed:admin

# ─────────────────────────────────────────────────────────────────────────────
# Docker (Development)
# ─────────────────────────────────────────────────────────────────────────────

docker-build:
	docker compose build

docker-up:
	docker compose up -d

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
