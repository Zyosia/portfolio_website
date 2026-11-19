/*
 * CV dates are `YYYY-MM`, or just `YYYY` when only the year is known (validated by the CV
 * schema). Precision is preserved when displaying: no invented months.
 */

import type { Locale } from './i18n/locales';
import { ui } from './i18n/ui';

const CV_DATE = /^(\d{4})(?:-(\d{2}))?$/;

export interface CvDate {
  readonly date: Date;
  readonly hasMonth: boolean;
}

/** Parses a `YYYY-MM` or `YYYY` string to the first day of that period, in UTC. */
export function parseCvDate(value: string): CvDate {
  const match = CV_DATE.exec(value);
  if (!match?.[1]) throw new Error(`Invalid CV date (expected YYYY-MM or YYYY): "${value}"`);
  const month = match[2] ? Number(match[2]) - 1 : 0;
  return { date: new Date(Date.UTC(Number(match[1]), month, 1)), hasMonth: Boolean(match[2]) };
}

/** `"Sep 2021"` / `"sept. 2021"`, or `"2021"` for a year-only date. */
export function formatCvDate(value: string, locale: Locale): string {
  const { date, hasMonth } = parseCvDate(value);
  if (!hasMonth) return String(date.getUTCFullYear());
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * `"Sep 2021 – Jun 2026"`, `"Jan 2025 – Present"` when there is no end, or a single date
 * when the period starts and ends at the same time (`"Jun 2022"`).
 */
export function formatPeriod(start: string, end: string | undefined, locale: Locale): string {
  if (end === start) return formatCvDate(start, locale);
  const to = end ? formatCvDate(end, locale) : ui(locale).cv.present;
  return `${formatCvDate(start, locale)} – ${to}`;
}

/** Newest first: current entries (no end) on top, then by end date, then by start date. */
export function sortByPeriodDesc<T extends { start: string; end?: string | undefined }>(
  entries: readonly T[],
): T[] {
  const endKey = (entry: T) => entry.end ?? '9999-12';
  return [...entries].sort(
    (a, b) => endKey(b).localeCompare(endKey(a)) || b.start.localeCompare(a.start),
  );
}
