import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

import { cvSchema, profileSchema, projectSchema } from './lib/schemas';

/** Site owner identity: single entry `main` in `src/content/profile.yaml`. */
const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: ({ image }) => profileSchema(image),
});

/** One Markdown file per project; the file name is the URL slug. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => projectSchema(image),
});

/** Structured CV: single entry `main` in `src/content/cv.yaml`. */
const cv = defineCollection({
  loader: file('src/content/cv.yaml'),
  schema: cvSchema,
});

export const collections = { profile, projects, cv };
