import { describe, expect, it } from 'vitest';

import { isActivePath, normalizePath } from '../../src/lib/paths';

describe('normalizePath', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
    ['/index.html', '/'],
    ['/about', '/about'],
    ['/about/', '/about'],
    ['/about.html', '/about'],
    ['about', '/about'],
    ['/projects/index.html', '/projects'],
    ['/projects/my-app.html', '/projects/my-app'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

describe('isActivePath', () => {
  it('matches the exact page', () => {
    expect(isActivePath('/projects', '/projects')).toBe(true);
    expect(isActivePath('/projects.html', '/projects')).toBe(true);
  });

  it('matches child pages', () => {
    expect(isActivePath('/projects/my-app', '/projects')).toBe(true);
  });

  it('does not match siblings sharing a prefix', () => {
    expect(isActivePath('/projects-archive', '/projects')).toBe(false);
  });

  it('only matches the root on the home page', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/about', '/')).toBe(false);
  });
});
