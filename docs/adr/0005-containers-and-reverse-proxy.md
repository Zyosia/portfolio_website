# 0005. Container images and reverse proxy configuration

- **Status**: Accepted
- **Date**: 2026-11-18

## Context

The site runs on a single VPS. Containers must be small, reproducible and hardened, and the
same images must run locally (`make up`) and in production. Development needs hot reload and
must never send real emails.

## Decision

**Images**

- Multi-stage Dockerfiles with base images pinned by version **and digest** (Dependabot
  bumps them). Each Dockerfile also has a `dev` stage used by `compose.dev.yaml`.
- `web`: Node stage builds Astro (`SITE_URL` build arg), then `caddy:alpine` serves `dist/`.
  The Caddyfile lives in `infra/caddy/` and enters the build through a **named build context**
  (`additional_contexts: caddy: ./infra/caddy`), so the frontend context stays `frontend/`.
- `api`: uv resolves the locked dependencies into `/opt/venv` in a builder stage; the runtime
  stage only copies the venv and `app/`.
- Both run as a **non-root numeric user (10001)**, with a `HEALTHCHECK`.

**Runtime hardening (compose.yaml)**

- `read_only: true` root filesystem with a `tmpfs` `/tmp`; Caddy state on named volumes.
- `cap_drop: [ALL]` and `no-new-privileges`. The non-root Caddy binds 80/443 thanks to the
  namespaced sysctl `net.ipv4.ip_unprivileged_port_start=0` instead of `CAP_NET_BIND_SERVICE`
  (file capabilities would be blocked by `no-new-privileges` anyway).
- CPU/memory limits, `restart: unless-stopped`, rotated JSON logs (3 × 10 MB).
- Only `web` publishes ports. `api` is on the `backend` network only (not `internal: true`,
  because it needs outbound SMTP).

**Caddy**

- Automatic HTTPS (local CA for `localhost`, Let's Encrypt for a real domain), HTTP/3.
- Security headers: CSP `frame-ancestors`/`base-uri`/`form-action`/`object-src` (the script
  and style hashes are in Astro's per-page `<meta>` CSP), HSTS (real domains only, so local
  development is not forced to HTTPS), `nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  COOP, `X-Frame-Options`, `Server` header removed.
- zstd/gzip compression; `/_astro/*` cached one year `immutable`, everything else revalidated.
- `/api/*` reverse-proxied to `api:8000` with `Cache-Control: no-store`. Caddy overwrites any
  client-supplied `X-Forwarded-For`, and uvicorn trusts it (`--proxy-headers`), so rate
  limiting uses the real client IP and cannot be bypassed by spoofing the header.

**Development**

- `compose.dev.yaml` swaps both services to their `dev` stage with bind mounts and polling
  file watchers (events do not cross Docker Desktop bind mounts), and adds Mailpit.

## Consequences

- Images are reproducible and small; rollbacks are just an older image tag.
- After changing frontend dependencies, the dev `node_modules` volume must be renewed:
  `docker compose -f compose.yaml -f compose.dev.yaml up --build --renew-anon-volumes`.
- Testing the production-like stack locally sends real emails through the SMTP settings of
  `.env`; point them at a Mailpit container to avoid it.
