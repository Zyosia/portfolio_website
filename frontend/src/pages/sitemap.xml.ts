import type { APIRoute } from 'astro';

import { getProjects } from '../lib/content';
import { localizePath, LOCALES } from '../lib/i18n/locales';
import { STATIC_PAGES } from '../lib/navigation';
import { buildSitemapXml } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` must be set to generate the sitemap.');
  const pages: string[] = [];
  for (const locale of LOCALES) {
    const projects = await getProjects(locale);
    const paths = [...STATIC_PAGES, ...projects.map((project) => `/projects/${project.slug}`)];
    pages.push(...paths.map((path) => localizePath(path, locale)));
  }
  return new Response(buildSitemapXml(pages, site), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
