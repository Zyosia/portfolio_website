/*
 * Client-side mirror of the server rules in backend/app/features/contact/schemas.py.
 * The server stays the authority; this only gives faster, friendlier feedback.
 */

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  subjectMax: 150,
  messageMin: 10,
  messageMax: 5000,
} as const;

export type ContactField = 'name' | 'email' | 'subject' | 'message';

export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: must stay empty for humans. */
  website: string;
}

export type FieldErrors = Partial<Record<ContactField, string>>;

/** Pragmatic check; the server performs full RFC validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAK = /[\r\n]/;

function validateName(name: string): string | undefined {
  if (name.length === 0) return 'Please enter your name.';
  if (name.length > CONTACT_LIMITS.nameMax)
    return `Please keep your name under ${CONTACT_LIMITS.nameMax} characters.`;
  if (LINE_BREAK.test(name)) return 'Your name must fit on a single line.';
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (email.length === 0) return 'Please enter your email address.';
  if (email.length > CONTACT_LIMITS.emailMax || !EMAIL_PATTERN.test(email))
    return 'Please enter a valid email address, like name@example.com.';
  return undefined;
}

function validateSubject(subject: string): string | undefined {
  if (subject.length > CONTACT_LIMITS.subjectMax)
    return `Please keep the subject under ${CONTACT_LIMITS.subjectMax} characters.`;
  if (LINE_BREAK.test(subject)) return 'The subject must fit on a single line.';
  return undefined;
}

function validateMessage(message: string): string | undefined {
  if (message.length < CONTACT_LIMITS.messageMin)
    return `Please write at least ${CONTACT_LIMITS.messageMin} characters.`;
  if (message.length > CONTACT_LIMITS.messageMax)
    return `Please keep your message under ${CONTACT_LIMITS.messageMax} characters.`;
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

/** Errors keyed by field, in form order. Empty object = valid. */
export function validateContact(values: ContactValues): FieldErrors {
  const normalized = normalizeContact(values);
  const errors: FieldErrors = {};
  const checks: [ContactField, string | undefined][] = [
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
