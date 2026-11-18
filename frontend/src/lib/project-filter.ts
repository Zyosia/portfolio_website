/*
 * Pure logic of the projects tag filter. The DOM wiring lives in
 * src/scripts/project-filter.ts.
 */

/** Query string parameter holding the selected tag, so a filtered view can be shared. */
export const TAG_QUERY_PARAM = 'tag';

/** Reads the selected tag from a query string, ignoring unknown values. */
export function readSelectedTag(search: string, knownTags: readonly string[]): string | null {
  const value = new URLSearchParams(search).get(TAG_QUERY_PARAM);
  return value !== null && knownTags.includes(value) ? value : null;
}

/** Query string for a selection; `''` when no tag is selected. */
export function buildTagSearch(currentSearch: string, tag: string | null): string {
  const params = new URLSearchParams(currentSearch);
  if (tag === null) params.delete(TAG_QUERY_PARAM);
  else params.set(TAG_QUERY_PARAM, tag);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function matchesTag(projectTags: readonly string[], selected: string | null): boolean {
  return selected === null || projectTags.includes(selected);
}

/** Text announced to screen readers after filtering. */
export function describeResults(visible: number, selectedLabel: string | null): string {
  const noun = visible === 1 ? 'project' : 'projects';
  return selectedLabel === null
    ? `Showing all ${visible} ${noun}`
    : `Showing ${visible} ${noun} tagged ${selectedLabel}`;
}
