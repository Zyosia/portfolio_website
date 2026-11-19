import { describe, expect, it } from 'vitest';

import { initials } from '../../src/lib/text';

describe('initials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['Ada', 'A'],
    ['  grace   brewster murray hopper ', 'GH'],
    ['Élodie Ånström', 'ÉÅ'],
    ['', ''],
  ])('%j → %j', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
