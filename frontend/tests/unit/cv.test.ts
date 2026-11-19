import { describe, expect, it } from 'vitest';

import { formatCvDate, formatPeriod, parseCvDate, sortByPeriodDesc } from '../../src/lib/cv';

describe('parseCvDate', () => {
  it('parses a month to the first day of that month in UTC', () => {
    expect(parseCvDate('2024-09')).toEqual({
      date: new Date('2024-09-01T00:00:00.000Z'),
      hasMonth: true,
    });
  });

  it('parses a year-only date without inventing a month', () => {
    expect(parseCvDate('2023')).toEqual({
      date: new Date('2023-01-01T00:00:00.000Z'),
      hasMonth: false,
    });
  });

  it('rejects malformed values', () => {
    expect(() => parseCvDate('09/2024')).toThrow('Invalid CV date');
  });
});

describe('formatCvDate / formatPeriod', () => {
  it('formats a month and a year-only date', () => {
    expect(formatCvDate('2021-09', 'en')).toBe('Sep 2021');
    expect(formatCvDate('2021-09', 'fr')).toBe('sept. 2021');
    expect(formatCvDate('2021', 'fr')).toBe('2021');
  });

  it('formats a closed period', () => {
    expect(formatPeriod('2021-09', '2026-06', 'en')).toBe('Sep 2021 – Jun 2026');
    expect(formatPeriod('2020', '2023', 'en')).toBe('2020 – 2023');
  });

  it('formats an ongoing period in the page language', () => {
    expect(formatPeriod('2025-01', undefined, 'en')).toBe('Jan 2025 – Present');
    expect(formatPeriod('2025-01', undefined, 'fr')).toBe('janv. 2025 – Aujourd’hui');
  });

  it('collapses a period that starts and ends in the same month', () => {
    expect(formatPeriod('2022-06', '2022-06', 'en')).toBe('Jun 2022');
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
