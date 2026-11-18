export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** Primary navigation, in display order. The home page is reached through the site logo. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
  { href: '/contact', label: 'Contact' },
];

/** Every static (non-collection) page, used for the sitemap. */
export const STATIC_PAGES: readonly string[] = ['/', ...NAV_ITEMS.map((item) => item.href)];
