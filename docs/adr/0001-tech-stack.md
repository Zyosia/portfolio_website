# 0001. Tech stack

- **Status**: Accepted
- **Date**: 2026-11-18

## Context

The portfolio has two jobs: present the author's work, and *be* evidence of their engineering
skills (code quality, tests, containers, CI/CD, documentation). It is mostly static content, has one
dynamic feature today (a contact form that sends an email) and will gain an AI chatbot later.
It is self-hosted on a single small VPS, maintained by one person, with a Lighthouse target of ≥ 95.

## Decision

| Area | Choice | Main reason |
|------|--------|-------------|
| Frontend framework | **Astro** (static output) + TypeScript strict | Ships zero JS by default, content collections with Zod schemas, islands when interactivity is needed |
| Styling | **Tailwind CSS** | Design tokens defined once, no dead CSS in production, fast iteration |
| Package manager (JS) | **pnpm** | Fast, strict dependency resolution, reliable lockfile |
| Frontend QA | ESLint, Prettier, Vitest, Playwright + axe | Unit tests for pure logic, real-browser smoke and accessibility tests |
| Backend | **Python 3.12+ / FastAPI** / Pydantic v2 / pydantic-settings | Best ecosystem for the planned AI features; typed, async, self-documented APIs |
| Package manager (Python) | **uv** | Fast, lockfile-based, manages the Python version too |
| Backend QA | Ruff, mypy `--strict`, pytest + pytest-cov, httpx | One fast linter/formatter, strict typing, coverage gate |
| Reverse proxy / static server | **Caddy** | Automatic HTTPS, simple config, compression and headers built in |
| Runtime | **Docker** + Docker Compose | Same artefacts locally, in CI and in production |
| CI/CD | GitHub Actions, GHCR, Dependabot, hadolint, Trivy | Free for public repos, registry next to the code, supply-chain hygiene |

Versions are the latest stable ones at project creation, pinned through lockfiles and pinned base images.

## Alternatives considered

- **Next.js / SvelteKit**: excellent, but server rendering is unnecessary for static content and adds a
  Node runtime in production. Astro gives the same DX with a static output.
- **Hugo / Eleventy**: very fast static generators, but weaker TypeScript integration and no
  first-class component islands for the future chatbot UI.
- **Node backend (Express/Fastify/Hono)**: one language end to end, but the Python AI ecosystem
  (LLM SDKs, embeddings, RAG tooling) is decisive for the planned chatbot.
- **Nginx / Traefik**: Nginx needs manual TLS automation; Traefik shines with many dynamic services,
  which is overkill for two containers.
- **Managed hosting (Vercel, Netlify)**: simpler, but self-hosting is an explicit goal of the project.

## Consequences

- Two languages to maintain (TypeScript and Python), each with its own toolchain; the `Makefile`
  hides this behind a single set of commands.
- The site works without JavaScript; any new interactivity must be justified and kept small.
- The backend can grow AI features without changing the deployment model.
