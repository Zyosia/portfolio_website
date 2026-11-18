import type { ImageFunction } from 'astro:content';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';

import { cvSchema, projectSchema } from '../../src/lib/schemas';

/*
 * Astro resolves `image()` to image metadata at build time. Here a stand-in schema accepts
 * any path, so these tests focus on the rules we own.
 */
const fakeImage = (() => z.string()) as unknown as ImageFunction;
const project = projectSchema(fakeImage);

const validProject = {
  title: 'My project',
  summary: 'A summary long enough to pass validation.',
  date: '2026-06-01',
  tags: ['AI'],
  techStack: ['Python'],
  cover: './cover.png',
  coverAlt: 'Screenshot of the dashboard',
};

describe('projectSchema', () => {
  it('accepts a valid project and applies defaults', () => {
    const parsed = project.parse(validProject);
    expect(parsed.featured).toBe(false);
    expect(parsed.draft).toBe(false);
    expect(parsed.date).toEqual(new Date('2026-06-01'));
  });

  it.each([
    ['missing tags', { tags: [] }],
    ['empty tech stack', { techStack: [] }],
    ['invalid repository URL', { repositoryUrl: 'not-a-url' }],
    ['invalid date', { date: 'yesterday' }],
    ['summary too short', { summary: 'Too short' }],
    ['blank alt text', { coverAlt: '   ' }],
  ])('rejects %s', (_label, override) => {
    expect(project.safeParse({ ...validProject, ...override }).success).toBe(false);
  });
});

describe('cvSchema', () => {
  const validCv = {
    experience: [{ role: 'Engineer', organization: 'ACME', start: '2024-01' }],
    education: [],
    skills: [{ category: 'DevOps', items: ['Docker'] }],
    languages: [{ name: 'English', level: 'Fluent' }],
    certifications: [],
  };

  it('accepts a valid CV', () => {
    expect(cvSchema.safeParse(validCv).success).toBe(true);
  });

  it.each(['2024-13', '2024-1', '01-2024'])('rejects the month value %s', (start) => {
    const cv = { ...validCv, experience: [{ ...validCv.experience[0], start }] };
    expect(cvSchema.safeParse(cv).success).toBe(false);
  });

  it('requires at least one skill group', () => {
    expect(cvSchema.safeParse({ ...validCv, skills: [] }).success).toBe(false);
  });
});
