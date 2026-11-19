import { clientStrings, type ContactErrorCode, type ContactField } from './i18n/client-strings';
import type { Locale } from './i18n/locales';

/*
 * Client-side mirror of the server rules in backend/app/features/contact/schemas.py.
 * The server stays the authority; this only gives faster, friendlier feedback.
 * Validation returns language-neutral error codes; `fieldErrorMessage` localises them.
 */

export type { ContactErrorCode, ContactField };

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  subjectMax: 150,
  messageMin: 10,
  messageMax: 5000,
} as const;

export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: must stay empty for humans. */
  website: string;
}

export type FieldErrors = Partial<Record<ContactField, ContactErrorCode>>;

/** Pragmatic check; the server performs full RFC validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAK = /[\r\n]/;

function validateName(name: string): ContactErrorCode | undefined {
  if (name.length === 0) return 'required';
  if (name.length > CONTACT_LIMITS.nameMax) return 'tooLong';
  if (LINE_BREAK.test(name)) return 'multiline';
  return undefined;
}

function validateEmail(email: string): ContactErrorCode | undefined {
  if (email.length === 0) return 'required';
  if (email.length > CONTACT_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) return 'invalid';
  return undefined;
}

function validateSubject(subject: string): ContactErrorCode | undefined {
  if (subject.length > CONTACT_LIMITS.subjectMax) return 'tooLong';
  if (LINE_BREAK.test(subject)) return 'multiline';
  return undefined;
}

function validateMessage(message: string): ContactErrorCode | undefined {
  if (message.length < CONTACT_LIMITS.messageMin) return 'tooShort';
  if (message.length > CONTACT_LIMITS.messageMax) return 'tooLong';
  return undefined;
}

/** Trims every field, as the server does before validating. */
export function normalizeContact(values: ContactValues): ContactValues {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    subject: values.subject.trim(),
    message: values.message.trim(),
    website: values.website,
  };
}

/** Error codes keyed by field, in form order. Empty object = valid. */
export function validateContact(values: ContactValues): FieldErrors {
  const normalized = normalizeContact(values);
  const errors: FieldErrors = {};
  const checks: [ContactField, ContactErrorCode | undefined][] = [
    ['name', validateName(normalized.name)],
    ['email', validateEmail(normalized.email)],
    ['subject', validateSubject(normalized.subject)],
    ['message', validateMessage(normalized.message)],
  ];
  for (const [field, error] of checks) {
    if (error) errors[field] = error;
  }
  return errors;
}

const LIMITS: Record<ContactField, { min: number; max: number }> = {
  name: { min: 1, max: CONTACT_LIMITS.nameMax },
  email: { min: 1, max: CONTACT_LIMITS.emailMax },
  subject: { min: 0, max: CONTACT_LIMITS.subjectMax },
  message: { min: CONTACT_LIMITS.messageMin, max: CONTACT_LIMITS.messageMax },
};

/** Human-readable message for an error code, in the page language. */
export function fieldErrorMessage(
  field: ContactField,
  code: ContactErrorCode,
  locale: Locale,
): string {
  const limit = code === 'tooShort' ? LIMITS[field].min : LIMITS[field].max;
  return clientStrings(locale).contact.fieldError(field, code, limit);
}
