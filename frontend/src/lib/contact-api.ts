import { normalizeContact, type ContactValues } from './contact-validation';
import type { ContactFailure } from './i18n/client-strings';

export const CONTACT_ENDPOINT = '/api/v1/contact';

/** Outcome of a submission; the UI turns a failure reason into a localised message. */
export type SubmitResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: ContactFailure };

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** Body sent to the API: trimmed values, empty subject omitted. */
export function toRequestBody(values: ContactValues): Record<string, string> {
  const { name, email, subject, message, website } = normalizeContact(values);
  return { name, email, message, website, ...(subject ? { subject } : {}) };
}

/** Posts the message and maps every outcome to a result. Never throws. */
export async function submitContact(
  values: ContactValues,
  fetchFn: FetchLike = (input, init) => fetch(input, init),
): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetchFn(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(toRequestBody(values)),
    });
  } catch {
    return { ok: false, reason: 'network' };
  }

  if (response.ok) return { ok: true };
  if (response.status === 422) return { ok: false, reason: 'validation' };
  if (response.status === 429) return { ok: false, reason: 'rate_limited' };
  return { ok: false, reason: 'unavailable' };
}
