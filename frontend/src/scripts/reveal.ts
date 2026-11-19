import { revealDelay } from '../lib/motion';

/*
 * Scroll reveal: elements marked `data-reveal` fade in the first time they enter the
 * viewport (styles in global.css). Elements entering together are slightly staggered.
 * Reveal-once on purpose: content that animates again on every scroll is distracting.
 */

const root = document.documentElement;

function revealAll(elements: Iterable<Element>): void {
  for (const element of elements) element.classList.add('is-revealed');
}

function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealAll(elements);
    root.classList.add('reveal-ready');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      entering.forEach((entry, index) => {
        const element = entry.target as HTMLElement;
        element.style.transitionDelay = `${revealDelay(index)}ms`;
        element.classList.add('is-revealed');
        observer.unobserve(element);
      });
    },
    // Reveal slightly before the element is fully in view, so it never feels late.
    { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
  );

  for (const element of elements) observer.observe(element);
  root.classList.add('reveal-ready');
}

initReveal();
