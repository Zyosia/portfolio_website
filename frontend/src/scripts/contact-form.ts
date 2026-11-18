import { submitContact } from '../lib/contact-api';
import {
  validateContact,
  type ContactField,
  type ContactValues,
  type FieldErrors,
} from '../lib/contact-validation';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const FIELDS: readonly ContactField[] = ['name', 'email', 'subject', 'message'];

function readValues(form: HTMLFormElement): ContactValues {
  const data = new FormData(form);
  const text = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value : '';
  };
  return {
    name: text('name'),
    email: text('email'),
    subject: text('subject'),
    message: text('message'),
    website: text('website'),
  };
}

function setFieldError(form: HTMLFormElement, field: ContactField, error?: string): void {
  const input = form.elements.namedItem(field);
  const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
  if (!(input instanceof HTMLElement) || !errorEl) return;

  errorEl.textContent = error ?? '';
  errorEl.hidden = !error;
  if (error) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function showFieldErrors(form: HTMLFormElement, errors: FieldErrors): void {
  for (const field of FIELDS) setFieldError(form, field, errors[field]);
}

function isContactField(value: string | null): value is ContactField {
  return FIELDS.some((field) => field === value);
}

function focusFirstInvalid(form: HTMLFormElement, errors: FieldErrors): void {
  const first = FIELDS.find((field) => errors[field]);
  const input = first ? form.elements.namedItem(first) : null;
  if (input instanceof HTMLElement) input.focus();
}

function initContactForm(form: HTMLFormElement): void {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = submit?.textContent ?? 'Send';

  // JavaScript takes over validation so messages are consistent and accessible.
  form.noValidate = true;

  function setState(state: FormState, message = ''): void {
    form.dataset['state'] = state;
    form.setAttribute('aria-busy', String(state === 'submitting'));
    if (submit) {
      submit.disabled = state === 'submitting';
      submit.textContent = state === 'submitting' ? 'Sending…' : submitLabel;
    }
    if (status) {
      status.textContent = message;
      status.dataset['state'] = state;
    }
  }

  // Clear a field's error as soon as it becomes valid, without nagging while typing.
  form.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.getAttribute('aria-invalid') !== 'true') return;
    const field = target.getAttribute('name');
    if (isContactField(field) && !validateContact(readValues(form))[field]) {
      setFieldError(form, field);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.dataset['state'] === 'submitting') return;

    const values = readValues(form);
    const errors = validateContact(values);
    showFieldErrors(form, errors);
    if (Object.keys(errors).length > 0) {
      setState('error', 'Please correct the highlighted fields.');
      focusFirstInvalid(form, errors);
      return;
    }

    setState('submitting', 'Sending your message…');
    const result = await submitContact(values);
    if (result.ok) {
      form.reset();
      setState('success', 'Thank you! Your message has been sent. I will get back to you soon.');
    } else {
      setState('error', result.message);
    }
  });

  setState('idle');
}

const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
if (form) initContactForm(form);
