# Portfolio website

Personal portfolio of TODO(content: name), a software engineer interested in software development,
AI and DevOps. The site is self-hosted with Docker and is itself a showcase of the engineering
practices it describes.

> Status: under construction. Sections below are completed phase by phase.

## Architecture

Static Astro site served by Caddy, with a FastAPI backend behind the same origin under `/api`.
See [ADR 0002](docs/adr/0002-architecture-static-frontend-api-reverse-proxy.md).

## Prerequisites

- Node.js 22+ and pnpm
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Docker with Docker Compose
- GNU Make and a POSIX shell (Linux, macOS, WSL or Git Bash on Windows)

## Quick start

```bash
cp .env.example .env
make install
make dev
```

## Commands

Run `make help` to list every target.

## Project structure

See [`CLAUDE.md`](CLAUDE.md#repository-layout).

## Documentation

- [Architecture decision records](docs/adr/)
- [Deployment](docs/deployment.md)
