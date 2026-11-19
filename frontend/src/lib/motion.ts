/*
 * Pure timing helpers of the decorative animations (scroll reveal, typed pitch), kept
 * apart from the DOM scripts so they can be unit tested.
 */

/** Delay between items revealed together, and the cap so long lists do not lag. */
export const REVEAL_STAGGER_MS = 80;
export const REVEAL_MAX_DELAY_MS = 400;

/** Transition delay of the `index`-th element of a batch revealed at the same time. */
export function revealDelay(index: number): number {
  return Math.min(Math.max(index, 0) * REVEAL_STAGGER_MS, REVEAL_MAX_DELAY_MS);
}

export interface TypingOptions {
  /** Total typing time is capped so long texts stay quick. */
  readonly maxDurationMs: number;
  /** Bounds of the time per character. */
  readonly minCharMs: number;
  readonly maxCharMs: number;
}

export const TYPING: TypingOptions = { maxDurationMs: 1600, minCharMs: 6, maxCharMs: 28 };

/** Milliseconds per character for a text of `length` characters. */
export function msPerChar(length: number, options: TypingOptions = TYPING): number {
  if (length <= 0) return options.maxCharMs;
  const fitted = options.maxDurationMs / length;
  return Math.min(Math.max(fitted, options.minCharMs), options.maxCharMs);
}

/** Number of characters visible `elapsedMs` after typing started. */
export function typedLength(elapsedMs: number, length: number, charMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.min(length, Math.floor(elapsedMs / charMs));
}
