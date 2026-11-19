import { describe, expect, it } from 'vitest';

import {
  CONTACT_LIMITS,
  fieldErrorMessage,
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
    ['name', 'required', { name: '   ' }],
    ['name', 'tooLong', { name: 'x'.repeat(CONTACT_LIMITS.nameMax + 1) }],
    ['name', 'multiline', { name: 'Ada\nBcc: x@example.com' }],
    ['email', 'required', { email: '' }],
    ['email', 'invalid', { email: 'ada@' }],
    ['email', 'invalid', { email: 'ada example@org.com' }],
    ['subject', 'tooLong', { subject: 'x'.repeat(CONTACT_LIMITS.subjectMax + 1) }],
    ['subject', 'multiline', { subject: 'Hi\r\nthere' }],
    ['message', 'tooShort', { message: '  too short  ' }],
    ['message', 'tooLong', { message: 'x'.repeat(CONTACT_LIMITS.messageMax + 1) }],
  ] as const)('reports %s: %s', (field, code, override) => {
    expect(validateContact({ ...valid, ...override })).toEqual({ [field]: code });
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

describe('fieldErrorMessage', () => {
  it('localises messages and includes the relevant limit', () => {
    expect(fieldErrorMessage('name', 'required', 'en')).toBe('Please enter your name.');
    expect(fieldErrorMessage('email', 'required', 'fr')).toBe(
      'Veuillez saisir votre adresse e-mail.',
    );
    expect(fieldErrorMessage('message', 'tooShort', 'en')).toContain(
      String(CONTACT_LIMITS.messageMin),
    );
    expect(fieldErrorMessage('subject', 'tooLong', 'fr')).toContain(
      String(CONTACT_LIMITS.subjectMax),
    );
  });
});
