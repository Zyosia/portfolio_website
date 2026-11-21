import { normalizePath } from './paths';

export interface Crumb {
  readonly label: string;
  /** Locale-independent path; absent for the current page, which is not a link. */
  readonly path?: string;
}

/** Label of the root crumb, styled as a shell home directory. */
export const HOME_CRUMB_LABEL = '~/home';

/**
 * Terminal-style breadcrumb of a locale-independent path:
 * `/projects/my-app` → `~/home` (→ `/`), `projects` (→ `/projects`), `my-app` (current).
 */
export function buildBreadcrumb(path: string): Crumb[] {
  const segments = normalizePath(path).split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: HOME_CRUMB_LABEL }];

  const crumbs: Crumb[] = [{ label: HOME_CRUMB_LABEL, path: '/' }];
  segments.forEach((segment, index) => {
    const isCurrent = index === segments.length - 1;
    crumbs.push(
      isCurrent
        ? { label: segment }
        : { label: segment, path: `/${segments.slice(0, index + 1).join('/')}` },
    );
  });
  return crumbs;
}
