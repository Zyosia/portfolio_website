import type { ImageFunction } from 'astro:content';
import { z } from 'astro/zod';

/*
 * Zod schemas of every content collection. Kept apart from `src/content.config.ts` so they
 * can be unit tested; Astro validates each content file against them and fails the build
 * on the first invalid one.
 */

/** Month precision is enough for a CV and avoids fake day-level accuracy: `2024-09`. */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a year and month formatted as YYYY-MM');

const nonEmpty = z.string().trim().min(1);

export const profileSchema = (image: ImageFunction) =>
  z.object({
    name: nonEmpty,
    jobTitle: nonEmpty,
    location: nonEmpty,
    pitch: nonEmpty,
    /** Default meta description for pages that do not define their own. */
    description: z.string().min(50).max(160),
    photo: image(),
    photoAlt: nonEmpty,
    /** About page paragraphs, in order. */
    bio: z.array(nonEmpty).min(1),
    interests: z.array(z.object({ title: nonEmpty, description: nonEmpty })).min(1),
    links: z.object({
      github: z.url(),
      linkedin: z.url(),
      /** Source code of this website, shown in the footer. */
      sourceRepository: z.url().optional(),
    }),
  });

export const projectSchema = (image: ImageFunction) =>
  z.object({
    title: nonEmpty.max(80),
    /** One or two sentences, shown on cards and as meta description. */
    summary: z.string().trim().min(20).max(200),
    date: z.coerce.date(),
    tags: z.array(nonEmpty).min(1),
    techStack: z.array(nonEmpty).min(1),
    cover: image(),
    coverAlt: nonEmpty,
    repositoryUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    featured: z.boolean().default(false),
    /** Drafts are visible with `pnpm dev` but excluded from production builds. */
    draft: z.boolean().default(false),
  });

const skillGroupSchema = z.object({
  category: nonEmpty,
  items: z.array(nonEmpty).min(1),
});

export const cvSchema = z.object({
  experience: z.array(
    z.object({
      role: nonEmpty,
      organization: nonEmpty,
      location: nonEmpty.optional(),
      start: yearMonth,
      /** Omitted for the current position. */
      end: yearMonth.optional(),
      highlights: z.array(nonEmpty).default([]),
    }),
  ),
  education: z.array(
    z.object({
      degree: nonEmpty,
      institution: nonEmpty,
      location: nonEmpty.optional(),
      start: yearMonth,
      end: yearMonth.optional(),
      details: z.array(nonEmpty).default([]),
    }),
  ),
  skills: z.array(skillGroupSchema).min(1),
  languages: z.array(z.object({ name: nonEmpty, level: nonEmpty })),
  certifications: z.array(
    z.object({
      name: nonEmpty,
      issuer: nonEmpty,
      date: yearMonth,
      url: z.url().optional(),
    }),
  ),
});

export type CvData = z.infer<typeof cvSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
