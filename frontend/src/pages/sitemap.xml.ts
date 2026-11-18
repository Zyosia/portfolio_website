import type { APIRoute } from 'astro';

import { getProjects } from '../lib/content';
import { STATIC_PAGES } from '../lib/navigation';
import { buildSitemapXml } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` must be set to generate the sitemap.');
  const projects = await getProjects();
  const pages = [...STATIC_PAGES, ...projects.map((project) => `/projects/${project.id}`)];
  return new Response(buildSitemapXml(pages, site), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
