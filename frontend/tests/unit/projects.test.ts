import { describe, expect, it } from 'vitest';

import {
  collectTags,
  filterPublished,
  formatMonthYear,
  selectFeatured,
  sortByDateDesc,
  tagSlug,
  type ProjectLike,
} from '../../src/lib/projects';

function project(
  id: string,
  date: string,
  overrides: Partial<ProjectLike['data']> = {},
): ProjectLike & { id: string } {
  return {
    id,
    data: { date: new Date(date), tags: [], featured: false, draft: false, ...overrides },
  };
}

const ids = (projects: readonly { id: string }[]) => projects.map((p) => p.id);

describe('sortByDateDesc', () => {
  it('puts the newest project first without mutating the input', () => {
    const input = [project('old', '2020-01-01'), project('new', '2024-01-01')];
    expect(ids(sortByDateDesc(input))).toEqual(['new', 'old']);
    expect(ids(input)).toEqual(['old', 'new']);
  });
});

describe('filterPublished', () => {
  const input = [project('live', '2024-01-01'), project('wip', '2024-02-01', { draft: true })];

  it('hides drafts in production', () => {
    expect(ids(filterPublished(input, { includeDrafts: false }))).toEqual(['live']);
  });

  it('keeps drafts in development', () => {
    expect(ids(filterPublished(input, { includeDrafts: true }))).toEqual(['live', 'wip']);
  });
});

describe('selectFeatured', () => {
  it('returns featured projects only, newest first, up to the limit', () => {
    const input = [
      project('a', '2021-01-01', { featured: true }),
      project('b', '2022-01-01'),
      project('c', '2023-01-01', { featured: true }),
      project('d', '2024-01-01', { featured: true }),
    ];
    expect(ids(selectFeatured(input, 2))).toEqual(['d', 'c']);
  });
});

describe('collectTags', () => {
  it('counts each tag once per project, most used first then alphabetical', () => {
    const input = [
      project('a', '2024-01-01', { tags: ['Web', 'AI', 'AI'] }),
      project('b', '2024-01-01', { tags: ['DevOps', 'AI'] }),
    ];
    expect(collectTags(input)).toEqual([
      { tag: 'AI', count: 2 },
      { tag: 'DevOps', count: 1 },
      { tag: 'Web', count: 1 },
    ]);
  });
});

describe('tagSlug', () => {
  it.each([
    ['DevOps', 'devops'],
    ['Machine Learning', 'machine-learning'],
    ['C++ / Rust', 'c-rust'],
    ['Données', 'donnees'],
  ])('%s → %s', (input, expected) => {
    expect(tagSlug(input)).toBe(expected);
  });
});

describe('formatMonthYear', () => {
  it('formats in UTC regardless of the local time zone', () => {
    expect(formatMonthYear(new Date('2026-06-01T00:00:00Z'))).toBe('June 2026');
  });
});
