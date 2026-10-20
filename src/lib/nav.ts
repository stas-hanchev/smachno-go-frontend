export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function safeNextPath(next: string | null | undefined, fallback = '/') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback;
  }
  return next;
}

export function isCabinetPath(pathname: string) {
  if (pathname.startsWith('/partner/invite')) return false;
  return isActivePath(pathname, '/partner') || isActivePath(pathname, '/admin');
}
