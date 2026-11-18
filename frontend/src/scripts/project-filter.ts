import {
  buildTagSearch,
  describeResults,
  matchesTag,
  readSelectedTag,
} from '../lib/project-filter';

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

    if (announce && status) status.textContent = describeResults(visible, selectedLabel);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = tagOf(button);
      applyFilter(selected, true);
      const search = buildTagSearch(window.location.search, selected);
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);
    });
  }

  root.hidden = false;
  applyFilter(readSelectedTag(window.location.search, knownTags), false);
}

const root = document.querySelector<HTMLElement>('[data-project-filter]');
if (root) initProjectFilter(root);
