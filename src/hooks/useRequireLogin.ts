'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useSessionStore } from '@/stores/session';

export function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function useLoginRedirect() {
  const router = useRouter();
  return useCallback(() => {
    router.push(loginHref(`${window.location.pathname}${window.location.search}`));
  }, [router]);
}

export function useRequireLogin() {
  const user = useSessionStore((s) => s.user);
  const redirect = useLoginRedirect();
  return useCallback(() => {
    if (user) return true;
    redirect();
    return false;
  }, [user, redirect]);
}
