import type { APIRoute } from 'astro';

import { buildRobotsTxt } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` must be set to generate robots.txt.');
  return new Response(buildRobotsTxt(site), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
