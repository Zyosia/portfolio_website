import { describe, expect, it } from 'vitest';

import {
  CONTACT_LIMITS,
  normalizeContact,
  validateContact,
  type ContactValues,
} from '../../src/lib/contact-validation';

const valid: ContactValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.org',
  subject: '',
  message: 'Hello, I would like to talk about a project.',
  website: '',
};

describe('validateContact', () => {
  it('accepts a valid message with an empty optional subject', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it.each([
    ['name', { name: '   ' }],
    ['name', { name: 'x'.repeat(CONTACT_LIMITS.nameMax + 1) }],
    ['name', { name: 'Ada\nBcc: x@example.com' }],
    ['email', { email: '' }],
    ['email', { email: 'ada@' }],
    ['email', { email: 'ada example@org.com' }],
    ['subject', { subject: 'x'.repeat(CONTACT_LIMITS.subjectMax + 1) }],
    ['subject', { subject: 'Hi\r\nthere' }],
    ['message', { message: '  too short  ' }],
    ['message', { message: 'x'.repeat(CONTACT_LIMITS.messageMax + 1) }],
  ] as const)('reports an error on %s', (field, override) => {
    const errors = validateContact({ ...valid, ...override });
    expect(Object.keys(errors)).toEqual([field]);
    expect(errors[field]).toMatch(/^Please|must fit/);
  });

  it('accepts values exactly at the limits', () => {
    expect(
      validateContact({
        ...valid,
        name: 'x'.repeat(CONTACT_LIMITS.nameMax),
        subject: 'x'.repeat(CONTACT_LIMITS.subjectMax),
        message: 'x'.repeat(CONTACT_LIMITS.messageMin),
      }),
    ).toEqual({});
  });

  it('lists errors in form order', () => {
    const errors = validateContact({ ...valid, name: '', message: '' });
    expect(Object.keys(errors)).toEqual(['name', 'message']);
  });
});

describe('normalizeContact', () => {
  it('trims visible fields but leaves the honeypot untouched', () => {
    expect(
      normalizeContact({ ...valid, name: '  Ada  ', subject: ' Hi ', website: ' x ' }),
    ).toMatchObject({ name: 'Ada', subject: 'Hi', website: ' x ' });
  });
});
