# 0006. Internationalisation (English and French)

- **Status**: Accepted; URL scheme superseded by [0007](0007-french-default-language.md)
- **Date**: 2026-11-19

## Context

The owner targets both French and international employers and has a CV in both languages.
The site must offer a language switch while staying static, fast, accessible, crawlable, and
easy to edit. ADR 0001 assumed a single language.

## Decision

- **URLs**: English, the default, stays at the root (`/about`); French is prefixed (`/fr/about`).
  Slugs are identical across languages, so switching language only changes the prefix and
  existing English URLs keep working. Path logic lives in `src/lib/i18n/locales.ts` (pure,
  unit tested) rather than in Astro's i18n routing, to keep it explicit and testable.
- **Pages**: page bodies are views in `src/components/views/` taking a `locale` prop; route
  files in `src/pages/` (English) and `src/pages/fr/` (French) are one-line wrappers.
- **Content**: `profile.yaml` and `cv.yaml` have one entry per locale; projects live in
  `projects/en/` and `projects/fr/`. A project missing in one language **fails the build**.
- **Interface strings**: typed dictionaries in `src/lib/i18n/ui.ts` (pages) and
  `client-strings.ts` (only what the browser scripts need, to keep the bundle small). The
  French object is typed against the English one: a missing key fails type checking.
  Client scripts read the page language from `<html lang>`.
- **Switch**: plain links (`hreflang`, `lang`) to the same page in the other language, in the
  header. No JavaScript, no automatic redirect based on the browser language (redirects hurt
  crawling and surprise users; the choice stays explicit).
- **SEO**: `<html lang>`, `rel="alternate" hreflang` for each language plus `x-default`,
  `og:locale` / `og:locale:alternate`, both languages listed in the sitemap.
- **404**: one page per language; Caddy serves `/fr/404.html` for unknown `/fr/*` URLs.

## Alternatives considered

- **Astro's built-in i18n routing**: covers the same URL scheme, but adds configuration-driven
  behaviour (redirects, fallbacks) the static site does not need; the explicit helpers are a
  few lines and fully unit tested.
- **Client-side translation (JSON + script)**: breaks the no-JavaScript and SEO goals.
- **Localised slugs** (`/fr/projets`): nicer French URLs, but needs a slug mapping for every
  page and project; not worth it for two languages.

## Consequences

- Every content change must be made twice; the build enforces that projects exist in both
  languages, and type checking enforces complete interface strings.
- Adding a third language means adding it to `LOCALES`, a dictionary entry, content entries
  and a `src/pages/<locale>/` folder.
