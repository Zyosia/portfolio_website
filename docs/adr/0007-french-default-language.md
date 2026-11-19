# 0007. French as the default language

- **Status**: Accepted
- **Date**: 2026-11-19

## Context

ADR 0006 served English at the root and French under `/fr`. The owner is French and most
visitors (recruiters, contacts) are expected to be French speakers, so the root URL, the
one shared and typed most often, should be in French. The site was already deployed, so
links to `/fr/...` may exist.

## Decision

- French is the default locale (`DEFAULT_LOCALE = 'fr'`) and lives at the root (`/about`);
  English is prefixed (`/en/about`). The path helpers of `src/lib/i18n/locales.ts` already
  derived everything from `DEFAULT_LOCALE`, so only the constant and the route folders
  changed (`src/pages/` is French, `src/pages/en/` is English).
- `x-default` in `hreflang` points to the French page, and unknown values of `<html lang>`
  fall back to French.
- Caddy permanently redirects the former French URLs (`/fr`, `/fr/*`) to the root, and
  serves `/en/404.html` for unknown `/en/*` URLs.
- Still no automatic redirect based on the browser language (same reasons as ADR 0006).

## Alternatives considered

- **Keep English at the root**: optimises for international visitors, who are expected to
  be the minority.
- **Redirect `/` by `Accept-Language`**: hurts crawling and caching, and surprises users;
  the explicit switch stays.

## Consequences

- Former English root URLs (`/about`) now show French; English visitors use the switch or
  `/en/...`. This is acceptable this early after launch.
- The `/fr` redirects can be removed once old links are unlikely to be used (they cost one
  Caddyfile block).
