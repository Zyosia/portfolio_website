import { getEntry } from 'astro:content';

/**
 * Thin accessors over content collections. Kept here so pages and components stay free
 * of lookup details; schemas live in `src/content.config.ts`.
 */
export async function getProfile() {
  const entry = await getEntry('profile', 'main');
  if (!entry) {
    throw new Error('Missing entry "main" in src/content/profile.yaml');
  }
  return entry.data;
}
