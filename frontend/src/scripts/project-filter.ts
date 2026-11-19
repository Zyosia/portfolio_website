import {
  buildTagSearch,
  describeResults,
  matchesTag,
  readSelectedTag,
} from '../lib/project-filter';
import { parseLocale } from '../lib/i18n/locales';

const locale = parseLocale(document.documentElement.lang);

/**
 * Runs a DOM update as a view transition, so cards fade out, fade in and slide to their new
 * place instead of jumping. Falls back to an instant update when the browser lacks the API
 * or the visitor prefers reduced motion. Cards are named only for the transition, so they
 * are not captured individually when navigating to another page.
 */
function animate(cards: readonly HTMLElement[], update: () => void): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }
  cards.forEach((card, index) => {
    card.style.viewTransitionName = `project-card-${index}`;
  });
  const transition = document.startViewTransition(update);
  void transition.finished.finally(() => {
    for (const card of cards) card.style.viewTransitionName = '';
  });
}

/** `""` on the "All" button means "no tag selected". */
function tagOf(button: HTMLButtonElement): string | null {
  return button.dataset['tag'] || null;
}

function initProjectFilter(root: HTMLElement): void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-tag]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-project-tags]')];
  const status = root.querySelector<HTMLElement>('[data-filter-status]');
  const knownTags = buttons.map(tagOf).filter((tag): tag is string => tag !== null);

  function applyFilter(selected: string | null, announce: boolean): void {
    let selectedLabel: string | null = null;
    for (const button of buttons) {
      const pressed = tagOf(button) === selected;
      button.setAttribute('aria-pressed', String(pressed));
      if (pressed && selected !== null) selectedLabel = button.dataset['label'] ?? selected;
    }

    let visible = 0;
    for (const card of cards) {
      const tags = (card.dataset['projectTags'] ?? '').split(' ');
      const show = matchesTag(tags, selected);
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (announce && status) status.textContent = describeResults(visible, selectedLabel, locale);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = tagOf(button);
      animate(cards, () => applyFilter(selected, true));
      const search = buildTagSearch(window.location.search, selected);
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);
    });
  }

  root.hidden = false;
  applyFilter(readSelectedTag(window.location.search, knownTags), false);
}

const root = document.querySelector<HTMLElement>('[data-project-filter]');
if (root) initProjectFilter(root);
