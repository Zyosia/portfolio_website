import { describe, expect, it } from 'vitest';

import { oppositeTheme, parseTheme, resolveTheme, toggleLabel } from '../../src/lib/theme';

describe('parseTheme', () => {
  it.each(['light', 'dark'] as const)('accepts %s', (value) => {
    expect(parseTheme(value)).toBe(value);
  });

  it.each([null, undefined, '', 'Dark', 'blue', 42])('rejects %s', (value) => {
    expect(parseTheme(value)).toBeNull();
  });
});

describe('resolveTheme', () => {
  it('prefers an explicit choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the system when no choice is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
});

describe('oppositeTheme / toggleLabel', () => {
  it('flips the theme', () => {
    expect(oppositeTheme('light')).toBe('dark');
    expect(oppositeTheme('dark')).toBe('light');
  });

  it('describes the action the button performs', () => {
    expect(toggleLabel('light')).toBe('Switch to dark theme');
    expect(toggleLabel('dark')).toBe('Switch to light theme');
  });
});
