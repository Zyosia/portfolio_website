import { getCollection, getEntry } from 'astro:content';

import type { Locale } from './i18n/locales';
import {
  filterPublished,
  findMissingTranslations,
  parseProjectId,
  sortByDateDesc,
} from './projects';

/*
 * Thin accessors over content collections, so pages and components stay free of lookup
 * details. Schemas live in src/lib/schemas.ts; the pure logic in sibling modules is unit
 * tested, these wrappers are covered by the build and the end-to-end tests.
 */

function missingEntry(file: string, locale: Locale): Error {
  return new Error(`Missing entry "${locale}" in src/content/${file}`);
}

export async function getProfile(locale: Locale) {
  const entry = await getEntry('profile', locale);
  if (!entry) throw missingEntry('profile.yaml', locale);
  return entry.data;
}

export async function getCv(locale: Locale) {
  const entry = await getEntry('cv', locale);
  if (!entry) throw missingEntry('cv.yaml', locale);
  return entry.data;
}

/**
 * Published projects of a locale, newest first, with their URL slug. Drafts are only
 * included by the dev server. Fails the build when a project lacks a translation.
 */
export async function getProjects(locale: Locale) {
  const all = await getCollection('projects');
  const missing = findMissingTranslations(all.map((project) => project.id));
  if (missing.length > 0) {
    throw new Error(
      `Missing project translations: ${missing.map((id) => `src/content/projects/${id}.md`).join(', ')}`,
    );
  }
  const projects = all
    .map((project) => ({ ...project, ...parseProjectId(project.id) }))
    .filter((project) => project.locale === locale);
  return sortByDateDesc(filterPublished(projects, { includeDrafts: import.meta.env.DEV }));
}

export type LocalizedProject = Awaited<ReturnType<typeof getProjects>>[number];
