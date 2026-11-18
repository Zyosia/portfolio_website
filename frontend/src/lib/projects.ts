/** The subset of a project entry the helpers below rely on (keeps them framework-free). */
export interface ProjectLike {
  readonly data: {
    readonly date: Date;
    readonly tags: readonly string[];
    readonly featured: boolean;
    readonly draft: boolean;
  };
}

export interface TagCount {
  readonly tag: string;
  readonly count: number;
}

/** Newest first. Returns a new array. */
export function sortByDateDesc<T extends ProjectLike>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Drops drafts unless explicitly requested (local development). */
export function filterPublished<T extends ProjectLike>(
  projects: readonly T[],
  { includeDrafts }: { includeDrafts: boolean },
): T[] {
  return includeDrafts ? [...projects] : projects.filter((project) => !project.data.draft);
}

/** Featured projects, newest first, at most `limit`. */
export function selectFeatured<T extends ProjectLike>(projects: readonly T[], limit = 3): T[] {
  return sortByDateDesc(projects.filter((project) => project.data.featured)).slice(0, limit);
}

/** Every tag with its number of projects, most used first, then alphabetically. */
export function collectTags(projects: readonly ProjectLike[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of new Set(project.data.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** URL- and attribute-safe identifier of a tag: `"Machine Learning"` → `"machine-learning"`. */
export function tagSlug(tag: string): string {
  return tag
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const monthYearFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `"June 2026"`. UTC so the build machine's time zone never shifts the month. */
export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}
