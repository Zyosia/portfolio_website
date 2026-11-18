# Single entry point for common tasks. Run `make help` to list targets.
# Requires a POSIX shell (Linux, macOS, WSL or Git Bash on Windows).

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help
MAKEFLAGS += --no-print-directory

FRONTEND := frontend
BACKEND := backend
COMPOSE := docker compose
COMPOSE_DEV := $(COMPOSE) -f compose.yaml -f compose.dev.yaml
HADOLINT_IMAGE := hadolint/hadolint:v2.15.1
DOCKERFILES := $(FRONTEND)/Dockerfile $(BACKEND)/Dockerfile

.PHONY: help install dev lint format typecheck test e2e build up down logs clean

help: ## List available targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install frontend + backend dependencies and pre-commit hooks
	cd $(FRONTEND) && pnpm install --frozen-lockfile
	cd $(FRONTEND) && pnpm exec playwright install chromium
	cd $(BACKEND) && uv sync --frozen
	uv tool install pre-commit
	pre-commit install

dev: ## Full stack with hot reload (Mailpit UI on http://localhost:8025)
	$(COMPOSE_DEV) up --build

lint: ## ESLint + Prettier check + Ruff + hadolint
	cd $(FRONTEND) && pnpm lint
	cd $(BACKEND) && uv run ruff check . && uv run ruff format --check .
	@for f in $(DOCKERFILES); do echo "hadolint $$f"; docker run --rm -i $(HADOLINT_IMAGE) < $$f; done

format: ## Auto-format frontend and backend code
	cd $(FRONTEND) && pnpm format
	cd $(BACKEND) && uv run ruff check --fix . && uv run ruff format .

typecheck: ## astro check + mypy --strict
	cd $(FRONTEND) && pnpm typecheck
	cd $(BACKEND) && uv run mypy app

test: ## Vitest + pytest (with coverage)
	cd $(FRONTEND) && pnpm test
	cd $(BACKEND) && uv run pytest

e2e: ## Playwright end-to-end and accessibility tests
	cd $(FRONTEND) && pnpm test:e2e

build: ## Build the frontend and both Docker images
	cd $(FRONTEND) && pnpm build
	$(COMPOSE) build

up: ## Run the production-like stack locally (https://localhost)
	$(COMPOSE) up -d --build

down: ## Stop the local stack (dev or production-like)
	$(COMPOSE_DEV) down --remove-orphans

logs: ## Follow logs of the running stack
	$(COMPOSE) logs -f

clean: ## Remove build artefacts and caches
	rm -rf $(FRONTEND)/dist $(FRONTEND)/.astro $(FRONTEND)/coverage $(FRONTEND)/test-results $(FRONTEND)/playwright-report
	rm -rf $(BACKEND)/.pytest_cache $(BACKEND)/.mypy_cache $(BACKEND)/.ruff_cache $(BACKEND)/htmlcov $(BACKEND)/.coverage
