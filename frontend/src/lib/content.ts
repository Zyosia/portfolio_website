import { getCollection, getEntry } from 'astro:content';

import { filterPublished, sortByDateDesc } from './projects';

/*
 * Thin accessors over content collections, so pages and components stay free of lookup
 * details. Schemas live in src/lib/schemas.ts; the pure logic in sibling modules is unit
 * tested, these wrappers are covered by the build and the end-to-end tests.
 */

function missingEntry(file: string): Error {
  return new Error(`Missing entry "main" in src/content/${file}`);
}

export async function getProfile() {
  const entry = await getEntry('profile', 'main');
  if (!entry) throw missingEntry('profile.yaml');
  return entry.data;
}

export async function getCv() {
  const entry = await getEntry('cv', 'main');
  if (!entry) throw missingEntry('cv.yaml');
  return entry.data;
}

/** Published projects, newest first. Drafts are only included by the dev server. */
export async function getProjects() {
  const projects = await getCollection('projects');
  return sortByDateDesc(filterPublished(projects, { includeDrafts: import.meta.env.DEV }));
}
