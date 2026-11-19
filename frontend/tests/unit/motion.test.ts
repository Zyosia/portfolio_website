import { describe, expect, it } from 'vitest';

import {
  msPerChar,
  REVEAL_MAX_DELAY_MS,
  REVEAL_STAGGER_MS,
  revealDelay,
  TYPING,
  typedLength,
} from '../../src/lib/motion';

describe('revealDelay', () => {
  it('staggers items revealed together, up to a cap', () => {
    expect(revealDelay(0)).toBe(0);
    expect(revealDelay(1)).toBe(REVEAL_STAGGER_MS);
    expect(revealDelay(100)).toBe(REVEAL_MAX_DELAY_MS);
    expect(revealDelay(-1)).toBe(0);
  });
});

describe('msPerChar', () => {
  it('fits long texts in the maximum duration, within bounds', () => {
    expect(msPerChar(200)).toBe(TYPING.maxDurationMs / 200);
    expect(msPerChar(10_000)).toBe(TYPING.minCharMs);
    expect(msPerChar(5)).toBe(TYPING.maxCharMs);
    expect(msPerChar(0)).toBe(TYPING.maxCharMs);
  });
});

describe('typedLength', () => {
  it('grows with time and stops at the full length', () => {
    expect(typedLength(-5, 100, 10)).toBe(0);
    expect(typedLength(0, 100, 10)).toBe(0);
    expect(typedLength(95, 100, 10)).toBe(9);
    expect(typedLength(5_000, 100, 10)).toBe(100);
  });
});
