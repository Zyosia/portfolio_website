import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Site owner identity, used by the layout, SEO and pages.
 * Single entry with id `main` in `src/content/profile.yaml`.
 */
const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: z.object({
    name: z.string().min(1),
    jobTitle: z.string().min(1),
    location: z.string().min(1),
    pitch: z.string().min(1),
    /** Default meta description for pages that do not define their own. */
    description: z.string().min(50).max(160),
    links: z.object({
      github: z.url(),
      linkedin: z.url(),
      /** Source code of this website, shown in the footer. */
      sourceRepository: z.url().optional(),
    }),
  }),
});

export const collections = { profile };
