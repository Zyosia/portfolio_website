const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Parses a `YYYY-MM` string (already validated by the CV schema) to a UTC date. */
export function parseYearMonth(value: string): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match?.[1] || !match[2]) throw new Error(`Invalid YYYY-MM value: "${value}"`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

/** `"Sep 2021"`. */
export function formatYearMonth(value: string): string {
  return monthFormatter.format(parseYearMonth(value));
}

/** `"Sep 2021 – Jun 2026"`, or `"Jan 2025 – Present"` when there is no end. */
export function formatPeriod(start: string, end?: string): string {
  return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`;
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
