import { msPerChar, typedLength } from '../lib/motion';

/*
 * Types the home pitch out like a terminal, once per browser session. The real text stays
 * in the page the whole time (made transparent, still read by screen readers and search
 * engines); an `aria-hidden` overlay on top shows the typed part and a block caret.
 * Skipped entirely when the visitor prefers reduced motion.
 */

const SESSION_KEY = 'typewriter-played';
const START_DELAY_MS = 400;
const CARET_LINGER_MS = 2200;

function alreadyPlayed(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Storage unavailable: play every time, harmless.
  }
  return false;
}

function typeOut(container: HTMLElement, source: HTMLElement): void {
  const text = source.textContent?.trim() ?? '';
  if (!text) return;

  const overlay = document.createElement('span');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.className = 'pointer-events-none absolute inset-0';
  const typed = document.createTextNode('');
  const caret = document.createElement('span');
  caret.className = 'typewriter-caret';
  overlay.append(typed, caret);

  container.classList.add('relative');
  source.classList.add('text-transparent');
  container.append(overlay);

  const charMs = msPerChar(text.length);
  let start: number | null = null;

  function finish(): void {
    window.setTimeout(() => {
      overlay.remove();
      source.classList.remove('text-transparent');
    }, CARET_LINGER_MS);
  }

  function frame(now: number): void {
    start ??= now;
    const length = typedLength(now - start, text.length, charMs);
    typed.data = text.slice(0, length);
    if (length < text.length) window.requestAnimationFrame(frame);
    else finish();
  }

  window.setTimeout(() => window.requestAnimationFrame(frame), START_DELAY_MS);
}

const container = document.querySelector<HTMLElement>('[data-typewriter]');
const source = container?.querySelector<HTMLElement>('[data-typewriter-text]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (container && source && !reducedMotion && !alreadyPlayed()) typeOut(container, source);
