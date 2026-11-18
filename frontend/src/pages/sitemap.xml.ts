import type { APIRoute } from 'astro';

import { STATIC_PAGES } from '../lib/navigation';
import { buildSitemapXml } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` must be set to generate the sitemap.');
  return new Response(buildSitemapXml(STATIC_PAGES, site), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
