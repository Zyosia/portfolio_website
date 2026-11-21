import { describe, expect, it } from 'vitest';

import { buildBreadcrumb } from '../../src/lib/breadcrumb';

describe('buildBreadcrumb', () => {
  it('links every ancestor and leaves the current page unlinked', () => {
    expect(buildBreadcrumb('/projects/my-app')).toEqual([
      { label: '~/home', path: '/' },
      { label: 'projects', path: '/projects' },
      { label: 'my-app' },
    ]);
  });

  it('handles a top-level page', () => {
    expect(buildBreadcrumb('/about')).toEqual([{ label: '~/home', path: '/' }, { label: 'about' }]);
  });

  it('marks the home crumb as current on the home page', () => {
    expect(buildBreadcrumb('/')).toEqual([{ label: '~/home' }]);
  });

  it('ignores a trailing slash', () => {
    expect(buildBreadcrumb('/projects/')).toEqual([
      { label: '~/home', path: '/' },
      { label: 'projects' },
    ]);
  });
});
