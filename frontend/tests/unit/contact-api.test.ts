import { describe, expect, it, vi } from 'vitest';

import { CONTACT_ENDPOINT, submitContact, toRequestBody } from '../../src/lib/contact-api';
import type { ContactValues } from '../../src/lib/contact-validation';

const values: ContactValues = {
  name: ' Ada ',
  email: 'ada@example.org',
  subject: '',
  message: 'Hello, I would like to talk about a project.',
  website: '',
};

const respond = (status: number) => vi.fn(() => Promise.resolve(new Response('{}', { status })));

describe('toRequestBody', () => {
  it('trims values and omits an empty subject', () => {
    expect(toRequestBody(values)).toEqual({
      name: 'Ada',
      email: 'ada@example.org',
      message: 'Hello, I would like to talk about a project.',
      website: '',
    });
  });

  it('keeps a filled subject', () => {
    expect(toRequestBody({ ...values, subject: 'Hi' })).toHaveProperty('subject', 'Hi');
  });
});

describe('submitContact', () => {
  it('posts JSON to the contact endpoint', async () => {
    const fetchFn = respond(200);
    await submitContact(values, fetchFn);

    expect(fetchFn).toHaveBeenCalledWith(
      CONTACT_ENDPOINT,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(toRequestBody(values)) }),
    );
  });

  it('reports success', async () => {
    expect(await submitContact(values, respond(200))).toEqual({ ok: true });
  });

  it.each([
    [422, 'validation'],
    [429, 'rate_limited'],
    [503, 'unavailable'],
    [500, 'unavailable'],
    [502, 'unavailable'],
  ] as const)('maps HTTP %i to %s', async (status, reason) => {
    const result = await submitContact(values, respond(status));
    expect(result).toMatchObject({ ok: false, reason });
    expect(result.ok || result.message.length > 0).toBe(true);
  });

  it('maps network failures without throwing', async () => {
    const fetchFn = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await submitContact(values, fetchFn)).toMatchObject({ ok: false, reason: 'network' });
  });
});
