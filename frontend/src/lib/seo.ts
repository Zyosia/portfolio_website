import { normalizePath } from './paths';

/** `"Projects · Jane Doe"`, or just the site name on the home page. */
export function buildPageTitle(pageTitle: string | undefined, siteName: string): string {
  const title = pageTitle?.trim();
  return title ? `${title} · ${siteName}` : siteName;
}

/** Absolute canonical URL of a page, in the site's canonical path form. */
export function buildCanonicalUrl(pathname: string, site: URL): string {
  return new URL(normalizePath(pathname), site).href;
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/** Minimal sitemap (https://www.sitemaps.org/protocol.html), one `<url>` per unique page. */
export function buildSitemapXml(pathnames: readonly string[], site: URL): string {
  const urls = [...new Set(pathnames.map((path) => buildCanonicalUrl(path, site)))].sort();
  const entries = urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobotsTxt(site: URL): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', site).href}`,
    '',
  ].join('\n');
}
