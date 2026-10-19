'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '@/api/auth';
import { useSessionStore } from '@/stores/session';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async (request: () => Promise<void> = logout) => {
    try {
      await request();
    } finally {
      useSessionStore.getState().clear();
      queryClient.clear();
      router.push('/');
    }
  };
}
