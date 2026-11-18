# CLAUDE.md

Guidance for Claude Code when working in this repository. Read this file fully before any task.
This file is the source of truth for architecture, stack, conventions and rules.

## Project overview

Personal portfolio website of a software engineer interested in software development, AI and DevOps.
It is **self-hosted on a VPS with Docker**. The site is itself a showcase: clean code, tests,
containers, CI/CD and documentation matter as much as the visual result.

**Features (current scope)**
- Home, Projects (list + detail pages), About, CV (HTML page + PDF download), Contact form (sends an email).

**Planned later (do NOT build now)**
- An AI chatbot ("ask me about this engineer"). Every choice made now must keep this easy to add
  without restructuring (see [Future: AI chatbot](#future-ai-chatbot)).

## Architecture

```
Internet ──► Caddy (TLS, security headers, compression, static files)
               ├── /          → Astro static build (served directly by Caddy)
               └── /api/*     → FastAPI backend (contact today, chat later)
```

- **Two containers**: `web` (Caddy + Astro static build) and `api` (FastAPI). Only `web` exposes ports (80/443).
  `api` lives on an internal Docker network.
- **Same origin**: the frontend calls `/api/...` through the reverse proxy → no CORS configuration needed.
- **Frontend = static** (Astro): fast, SEO friendly, zero JS by default. Interactivity only through small
  scripts or islands when needed.
- **Backend = Python/FastAPI**: chosen because Python has the best ecosystem for future AI features
  (LLM SDKs, embeddings, RAG) and FastAPI gives typed, documented, async APIs.
- Every architectural decision is recorded as an ADR in `docs/adr/`.

## Repository layout

```
.
├── CLAUDE.md
├── README.md
├── Makefile                  # single entry point for common tasks (`make help`)
├── compose.yaml              # production-like stack (web + api)
├── compose.dev.yaml          # dev overrides: hot reload, Mailpit for emails
├── .env.example              # every env var documented here, no real values
├── .pre-commit-config.yaml
├── .github/
│   ├── workflows/            # ci.yml, deploy.yml
│   └── dependabot.yml
├── docs/
│   ├── adr/                  # NNNN-short-title.md (context, decision, consequences)
│   └── deployment.md         # VPS setup + deploy + rollback procedure
├── infra/
│   ├── caddy/Caddyfile
│   └── scripts/              # deploy / maintenance helpers (bash, `set -euo pipefail`)
├── frontend/                 # Astro app
│   ├── src/
│   │   ├── components/       # reusable UI components (PascalCase.astro)
│   │   ├── layouts/          # page layouts
│   │   ├── pages/            # routes only, thin
│   │   ├── content/          # projects (Markdown/MDX), CV structured data
│   │   ├── lib/              # pure TypeScript helpers (unit tested)
│   │   ├── scripts/          # small client-side scripts (contact form, theme toggle)
│   │   └── styles/           # global CSS + design tokens
│   ├── public/               # static assets, cv.pdf, favicon, robots.txt
│   ├── tests/                # unit/ (Vitest) and e2e/ (Playwright)
│   └── Dockerfile
└── backend/                  # FastAPI app
    ├── app/
    │   ├── main.py           # app factory, router registration
    │   ├── core/             # config (pydantic-settings), logging, error handling
    │   ├── shared/           # cross-feature services (email client, rate limiter)
    │   └── features/
    │       └── contact/      # router.py, schemas.py, service.py
    ├── tests/                # mirrors app/ structure
    ├── pyproject.toml
    └── Dockerfile
```

Backend code is organised **by feature**: a future chatbot becomes `app/features/chat/` with the same shape.

## Tech stack

| Area      | Tools |
|-----------|-------|
| Frontend  | Astro (static output), TypeScript strict, Tailwind CSS, pnpm |
| Front QA  | ESLint, Prettier (+ prettier-plugin-astro), Vitest, Playwright (+ axe for a11y) |
| Backend   | Python 3.12+, FastAPI, Pydantic v2, pydantic-settings, uv |
| Back QA   | Ruff (lint + format), mypy (strict), pytest, pytest-cov, httpx |
| Infra     | Docker (multi-stage), Docker Compose, Caddy, Mailpit (dev only) |
| CI/CD     | GitHub Actions, GitHub Container Registry (GHCR), Dependabot, hadolint, Trivy |

Use the latest stable versions at project creation, then pin them (lockfiles committed, base images pinned).
**Do not add a dependency that is not in this table without asking first.**

## Commands

Prefer `make` targets; they wrap the per-app commands.

```bash
make help        # list all targets
make install     # install frontend + backend dependencies, pre-commit hooks
make dev         # full stack with hot reload (compose.dev.yaml), Mailpit UI on :8025
make lint        # ESLint + Prettier check + Ruff + hadolint
make format      # auto-format everything
make typecheck   # astro check / tsc + mypy
make test        # Vitest + pytest (with coverage)
make e2e         # Playwright tests
make build       # build frontend + docker images
make up / down   # run / stop the production-like stack locally
```

Per app:
- Frontend (`frontend/`): `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`
- Backend (`backend/`): `uv sync`, `uv run fastapi dev app/main.py`, `uv run pytest`,
  `uv run ruff check .`, `uv run ruff format .`, `uv run mypy app`

## Coding conventions

### General
- Readability over cleverness. Small functions with one responsibility. Names state intent.
- Comments explain **why**, not what. No commented-out code, no dead code.
- No `TODO` without context. Personal content not yet provided is marked `TODO(content)`.
- Never hardcode secrets, emails, domains or URLs: use env vars, documented in `.env.example`.
- Keep files short and cohesive; split when a file mixes concerns.

### TypeScript / Astro
- `strict` mode. No `any`, no `@ts-ignore`, no non-null assertions without a justifying comment.
- Components: `PascalCase.astro`, props declared with `interface Props`.
- Pages stay thin: they compose layouts and components. Logic goes to `src/lib/` (pure, tested).
- All content goes through **content collections with Zod schemas**; a schema error must fail the build.
- Zero JS by default. Client-side code only when needed, as small typed scripts in `src/scripts/`.
  Future rich interactivity → islands (`client:visible`), not a global SPA.
- Tailwind: design tokens (colors, fonts, spacing, radii) defined once in the theme. Repeated class
  patterns become components, not `@apply` everywhere.
- Accessibility is required: semantic HTML, one `h1` per page, alt text, labelled inputs, visible focus,
  keyboard navigation, WCAG AA contrast, `prefers-reduced-motion` respected.
- Images through Astro's image optimisation (`<Image />`), with explicit dimensions.

### Python / FastAPI
- Type hints everywhere; `mypy --strict` must pass.
- Feature module layout:
  - `router.py` → HTTP only (parsing, status codes, dependencies)
  - `schemas.py` → Pydantic request/response models
  - `service.py` → business logic, **no FastAPI imports**, easy to unit test
- Settings via a cached `get_settings()` (pydantic-settings), injected with `Depends`.
- Services raise domain exceptions; a central handler in `core/` maps them to HTTP errors.
  Never leak stack traces or internal messages to clients.
- Structured logging (JSON in production). No `print`. Never log secrets or message bodies (PII).
- Network I/O (SMTP, future LLM calls) is async.

## API conventions
- All routes under `/api/v1/...`; health check at `GET /api/health` (used by Docker healthchecks).
- Request/response bodies are Pydantic models. OpenAPI docs (`/api/docs`) enabled in dev only.
- Error shape: `{"error": {"code": "string", "message": "human readable"}}`.

## Contact form rules
- Fields: `name`, `email`, `subject` (optional), `message`. Server validation is the authority;
  client validation mirrors it for UX only.
- Anti-spam: honeypot field + per-IP rate limit (e.g. 5 requests/hour). Caddy forwards the real client IP.
- Email sent via **SMTP of a transactional provider** (e.g. Brevo, Resend, Mailgun) configured by env vars.
  Do **not** self-host a mail server. `From` = site address, `Reply-To` = visitor's address.
- Dev: emails go to **Mailpit** (compose.dev.yaml) — never to a real inbox.
- UI states: idle, submitting, success, error — announced with `aria-live`.

## Testing
- Backend: unit tests for services (SMTP client mocked), API tests for routers. Coverage ≥ 80%.
- Frontend: Vitest for `src/lib/` and scripts; Playwright smoke tests (every page renders, navigation,
  theme toggle, contact form with mocked API) + axe accessibility checks.
- Every bug fix comes with a regression test.
- Never delete, skip or weaken a test to make a build pass.

## Docker & infrastructure
- Multi-stage builds, small pinned base images, **non-root user**, `HEALTHCHECK` in each image,
  `.dockerignore` in each app.
- `web` image: build Astro in a Node stage → copy `dist/` into a Caddy image.
- `api` image: install with uv in a builder stage → slim Python runtime image.
- Caddy: automatic HTTPS, security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, frame-ancestors), zstd/gzip compression, long cache for hashed assets,
  short cache for HTML.
- Containers: restart policies, resource limits, log rotation, read-only filesystem where possible.
- Configuration through `.env` (never committed). Production secrets live in GitHub secrets / the VPS.

## CI/CD
- `ci.yml` (pull requests + pushes): lint, typecheck, tests, builds for both apps; hadolint;
  Docker image build; Trivy vulnerability scan. Jobs cached and run in parallel where possible.
- `deploy.yml` (push to `main`, after CI passes): build and push images to GHCR tagged with the git SHA
  (+ `latest`), deploy over SSH (`docker compose pull && docker compose up -d`), then check
  `/api/health`. Rollback = redeploy a previous SHA tag (documented in `docs/deployment.md`).
- Dependabot for npm, Python, Docker and GitHub Actions.

## Git workflow
- `main` is always deployable. Work on short-lived branches, merge through PRs.
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`, `build:`.
- Small commits, one logical change each. Pre-commit hooks must pass (never `--no-verify`).

## Rules for Claude
1. Before a non-trivial change, give a short plan and the list of files you will touch.
2. Before saying a task is done, run lint, typecheck and tests for what you changed, and fix failures.
   Never disable a lint rule or type check to silence an error without asking.
3. Follow existing patterns. If a pattern seems wrong, propose a change instead of diverging silently.
4. Record architectural decisions as ADRs in `docs/adr/` (`NNNN-title.md`: context, decision, consequences).
5. Update `README.md`, `.env.example` and `docs/` whenever commands, env vars or behaviour change.
6. **Ask first** before: adding a dependency, changing the architecture, touching deployment/secrets,
   or deleting files.
7. **Never invent personal content** (bio, projects, experience, CV). Use `TODO(content)` placeholders
   and ask me.
8. Keep answers and summaries short: what changed, how to verify it, what is next.

## Future: AI chatbot

Not in scope now. When it comes, it will be:
- `backend/app/features/chat/` → `POST /api/v1/chat`, streaming responses (Server-Sent Events),
  LLM provider chosen through settings (provider-agnostic interface), knowledge from the same
  content files as the site (projects, CV).
- A frontend island component loaded only on the pages that use it.

So today: keep the API behind `/api`, keep features isolated, keep content structured
(Markdown + data files with schemas), and keep the settings pattern provider-agnostic.
