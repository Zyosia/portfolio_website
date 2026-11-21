import type { ImageFunction } from 'astro:content';
import { z } from 'astro/zod';

/*
 * Zod schemas of every content collection. Kept apart from `src/content.config.ts` so they
 * can be unit tested; Astro validates each content file against them and fails the build
 * on the first invalid one.
 */

/**
 * CV dates: `2024-09`, or `2024` when only the year is known. Month precision is enough
 * for a CV and avoids fake day-level accuracy.
 */
const cvDate = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Expected a date formatted as YYYY-MM or YYYY');

const nonEmpty = z.string().trim().min(1);

export const profileSchema = (image: ImageFunction) =>
  z
    .object({
      name: nonEmpty,
      jobTitle: nonEmpty,
      location: nonEmpty,
      pitch: nonEmpty,
      /** Default meta description for pages that do not define their own. */
      description: z.string().min(50).max(160),
      /** Optional: the About page shows the initials until a photo is provided. */
      photo: image().optional(),
      photoAlt: nonEmpty.optional(),
      /** About page paragraphs, in order. */
      bio: z.array(nonEmpty).min(1),
      interests: z.array(z.object({ title: nonEmpty, description: nonEmpty })).min(1),
      links: z.object({
        github: z.url(),
        linkedin: z.url(),
        /** Source code of this website, shown in the footer. */
        sourceRepository: z.url().optional(),
      }),
    })
    .refine((profile) => !profile.photo || profile.photoAlt, {
      message: 'photoAlt is required when a photo is set',
      path: ['photoAlt'],
    });

export const projectSchema = (image: ImageFunction) =>
  z.object({
    title: nonEmpty.max(80),
    /** One or two sentences, shown on cards and as meta description. */
    summary: z.string().trim().min(20).max(200),
    date: z.coerce.date(),
    tags: z.array(nonEmpty).min(1),
    techStack: z.array(nonEmpty).min(1),
    /** Solo or team work: recruiters read the two very differently. */
    collaboration: z.enum(['personal', 'team']),
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
  /** Downloadable PDF of this CV, in the same language, served from public/. */
  pdf: z.string().regex(/^\/[\w.-]+\.pdf$/, 'Expected a root-relative path such as /cv-en.pdf'),
  experience: z.array(
    z.object({
      role: nonEmpty,
      organization: nonEmpty,
      location: nonEmpty.optional(),
      start: cvDate,
      /** Omitted for the current position. */
      end: cvDate.optional(),
      highlights: z.array(nonEmpty).default([]),
    }),
  ),
  education: z.array(
    z.object({
      degree: nonEmpty,
      institution: nonEmpty,
      location: nonEmpty.optional(),
      start: cvDate,
      end: cvDate.optional(),
      details: z.array(nonEmpty).default([]),
    }),
  ),
  skills: z.array(skillGroupSchema).min(1),
  languages: z.array(z.object({ name: nonEmpty, level: nonEmpty })),
  certifications: z.array(
    z.object({
      name: nonEmpty,
      issuer: nonEmpty,
      date: cvDate,
      url: z.url().optional(),
    }),
  ),
});

export type CvData = z.infer<typeof cvSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
