# syntax=docker/dockerfile:1

# Base images are pinned by version and digest; Dependabot keeps them up to date.
ARG NODE_IMAGE=node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5
ARG CADDY_IMAGE=caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0

# ---------------------------------------------------------------------------
# deps: install node_modules once, reused by the dev and build stages
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS deps
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    ASTRO_TELEMETRY_DISABLED=1
RUN npm install --global --no-fund --no-audit pnpm@12.21.0
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# dev: Astro dev server with hot reload (source bind-mounted by compose.dev.yaml)
# ---------------------------------------------------------------------------
FROM deps AS dev
EXPOSE 4321
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "4321"]

# ---------------------------------------------------------------------------
# build: static site in /app/dist
# ---------------------------------------------------------------------------
FROM deps AS build
# Canonical site URL baked into canonical links, Open Graph tags and the sitemap.
ARG SITE_URL=https://localhost
ENV SITE_URL=${SITE_URL}
COPY . .
RUN pnpm build

# ---------------------------------------------------------------------------
# runtime: Caddy serving the static build and proxying /api, as a non-root user
# ---------------------------------------------------------------------------
FROM ${CADDY_IMAGE} AS runtime
# Caddy keeps certificates in /data and autosaved config in /config (mounted as volumes).
ENV XDG_DATA_HOME=/data \
    XDG_CONFIG_HOME=/config
RUN addgroup -S -g 10001 web && adduser -S -u 10001 -G web -H -s /sbin/nologin web \
    && mkdir -p /data /config \
    && chown -R 10001:10001 /data /config
# `caddy` is a named build context (infra/caddy, see compose.yaml), not a stage, which
# hadolint cannot know about.
# hadolint ignore=DL3022
COPY --from=caddy Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
USER 10001:10001
EXPOSE 80 443 443/udp
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/healthz"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
