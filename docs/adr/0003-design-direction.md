# 0003. Design direction

- **Status**: Accepted (open to revision by the site owner)
- **Date**: 2026-11-18

## Context

The site must not look like a generic template, must reach Lighthouse ≥ 95 in every category,
work in light and dark themes and stay readable without JavaScript. The owner's profile is
software, AI and DevOps, so a developer-oriented identity fits, as long as it stays readable
for non-technical visitors (recruiters).

Two directions were considered.

### A. "Terminal editorial" (chosen)

Typography-first, generous whitespace, warm off-white / near-black backgrounds, **one amber
accent**. Developer cues are small and consistent rather than decorative: monospace
(JetBrains Mono) breadcrumbs like `$ cd ~/projects`, a `~/` logo prefix, `./` marking the
active navigation link, numbered section headings (`01 Featured projects`). Body text in Inter.

### B. "Blueprint"

Technical-drawing aesthetic: blue-grey grid paper background, thin 1px rules, annotation-style
labels and arrows, cards drawn like system-diagram boxes, cyan accent.

## Decision

We use **direction A**. It ages better, keeps the content (projects) as the visual focus, needs
no background imagery (better performance) and its cues degrade gracefully on small screens.
Direction B is more distinctive but its grid and annotation details get noisy on mobile and
make WCAG AA contrast harder on textured backgrounds.

Implementation choices:

- Colours are semantic tokens (`bg`, `surface`, `fg`, `muted`, `border`, `accent`...) defined once
  in `src/styles/global.css` with CSS `light-dark()`. Components never hard-code colours.
- Theme: follows the system by default; an explicit toggle choice is stored in `localStorage`
  and applied before first paint by a tiny inline script.
- Fonts (Inter, JetBrains Mono) are self-hosted through Astro's Fonts API: no runtime request
  to a third party, which also keeps the CSP strict.

## Consequences

- Swapping the accent colour, or adopting direction B later, is a token-level change.
- Monospace accents must stay decorative: any meaningful text keeps a readable equivalent
  (decorative prefixes are `aria-hidden`).
