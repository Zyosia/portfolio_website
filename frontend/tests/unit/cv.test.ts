import { describe, expect, it } from 'vitest';

import { formatPeriod, formatYearMonth, parseYearMonth, sortByPeriodDesc } from '../../src/lib/cv';

describe('parseYearMonth', () => {
  it('parses to the first day of the month in UTC', () => {
    expect(parseYearMonth('2024-09').toISOString()).toBe('2024-09-01T00:00:00.000Z');
  });

  it('rejects malformed values', () => {
    expect(() => parseYearMonth('09/2024')).toThrow('Invalid YYYY-MM');
  });
});

describe('formatYearMonth / formatPeriod', () => {
  it('formats a single month', () => {
    expect(formatYearMonth('2021-09')).toBe('Sep 2021');
  });

  it('formats a closed period', () => {
    expect(formatPeriod('2021-09', '2026-06')).toBe('Sep 2021 – Jun 2026');
  });

  it('formats an ongoing period', () => {
    expect(formatPeriod('2025-01')).toBe('Jan 2025 – Present');
  });
});

describe('sortByPeriodDesc', () => {
  it('lists current entries first, then by end date, then by start date', () => {
    const entries = [
      { id: 'old', start: '2018-01', end: '2019-01' },
      { id: 'current', start: '2023-01' },
      { id: 'recent-long', start: '2019-01', end: '2022-06' },
      { id: 'recent-short', start: '2022-01', end: '2022-06' },
    ];
    expect(sortByPeriodDesc(entries).map((e) => e.id)).toEqual([
      'current',
      'recent-short',
      'recent-long',
      'old',
    ]);
  });
});
