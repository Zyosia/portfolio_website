/**
 * Normalises a URL pathname to the site's canonical form: leading slash, no trailing
 * slash, no `.html` extension and no `/index` suffix. The root stays `/`.
 */
export function normalizePath(pathname: string): string {
  let path = pathname.trim();
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\.html$/, '').replace(/\/index$/, '');
  path = path.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

/** Whether a navigation link points to the current page or one of its children. */
export function isActivePath(currentPath: string, href: string): boolean {
  const current = normalizePath(currentPath);
  const target = normalizePath(href);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}
