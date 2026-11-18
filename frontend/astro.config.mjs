// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// Canonical URL of the deployed site (canonical links, Open Graph, sitemap).
// Provided at build time through the SITE_URL env var; see .env.example.
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  // `/about` is emitted as `about.html` and served without a trailing slash by Caddy.
  trailingSlash: 'never',
  build: { format: 'file' },
  security: {
    // Astro emits a per-page <meta> CSP with hashes for its own scripts and styles.
    // Headers that cannot live in a <meta> tag (frame-ancestors, HSTS...) are set by Caddy.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  // Fonts are downloaded at build time and self-hosted: no third-party request at runtime.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['400', '600'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
