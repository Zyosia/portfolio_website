import type { UiStrings } from './i18n/ui';

export interface NavItem {
  /** Locale-independent path; localise it with `localizePath`. */
  readonly path: string;
  /** Key of the label in the `nav` section of the UI strings. */
  readonly labelKey: Exclude<keyof UiStrings['nav'], 'label' | 'menu'>;
}

/** Primary navigation, in display order. The home page is reached through the site logo. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/projects', labelKey: 'projects' },
  { path: '/about', labelKey: 'about' },
  { path: '/cv', labelKey: 'cv' },
  { path: '/contact', labelKey: 'contact' },
];

/** Every static (non-collection) page, locale-independent, used for the sitemap. */
export const STATIC_PAGES: readonly string[] = ['/', ...NAV_ITEMS.map((item) => item.path)];
