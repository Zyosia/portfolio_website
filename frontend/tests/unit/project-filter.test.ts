import { describe, expect, it } from 'vitest';

import {
  buildTagSearch,
  describeResults,
  matchesTag,
  readSelectedTag,
} from '../../src/lib/project-filter';

describe('readSelectedTag', () => {
  const known = ['ai', 'devops'];

  it('reads a known tag from the query string', () => {
    expect(readSelectedTag('?tag=ai', known)).toBe('ai');
  });

  it('ignores missing or unknown tags', () => {
    expect(readSelectedTag('', known)).toBeNull();
    expect(readSelectedTag('?tag=cobol', known)).toBeNull();
  });
});

describe('buildTagSearch', () => {
  it('sets, replaces and removes the tag while keeping other params', () => {
    expect(buildTagSearch('', 'ai')).toBe('?tag=ai');
    expect(buildTagSearch('?tag=ai&ref=x', 'devops')).toBe('?tag=devops&ref=x');
    expect(buildTagSearch('?tag=ai&ref=x', null)).toBe('?ref=x');
    expect(buildTagSearch('?tag=ai', null)).toBe('');
  });
});

describe('matchesTag', () => {
  it('matches everything when no tag is selected', () => {
    expect(matchesTag([], null)).toBe(true);
  });

  it('matches only projects carrying the tag', () => {
    expect(matchesTag(['ai', 'web'], 'ai')).toBe(true);
    expect(matchesTag(['web'], 'ai')).toBe(false);
  });
});

describe('describeResults', () => {
  it('handles plural and singular, with and without a tag', () => {
    expect(describeResults(3, null)).toBe('Showing all 3 projects');
    expect(describeResults(1, 'AI')).toBe('Showing 1 project tagged AI');
  });
});
