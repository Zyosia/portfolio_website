import { normalizeContact, type ContactValues } from './contact-validation';

export const CONTACT_ENDPOINT = '/api/v1/contact';

export type SubmitResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'validation' | 'rate_limited' | 'unavailable' | 'network';
      readonly message: string;
    };

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

const MESSAGES = {
  validation: 'Some fields are invalid. Please check them and try again.',
  rate_limited:
    'You have sent several messages recently. Please wait a little before trying again, or reach me through the links on this page.',
  unavailable:
    'Your message could not be sent right now. Please try again later, or reach me through the links on this page.',
  network: 'The connection failed. Please check your internet connection and try again.',
} as const;

/** Body sent to the API: trimmed values, empty subject omitted. */
export function toRequestBody(values: ContactValues): Record<string, string> {
  const { name, email, subject, message, website } = normalizeContact(values);
  return { name, email, message, website, ...(subject ? { subject } : {}) };
}

function failure(reason: Exclude<SubmitResult, { ok: true }>['reason']): SubmitResult {
  return { ok: false, reason, message: MESSAGES[reason] };
}

/** Posts the message and maps every outcome to a user-facing result. Never throws. */
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
    return failure('network');
  }

  if (response.ok) return { ok: true };
  if (response.status === 422) return failure('validation');
  if (response.status === 429) return failure('rate_limited');
  return failure('unavailable');
}
