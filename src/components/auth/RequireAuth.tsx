'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { loginHref } from '@/hooks/useRequireLogin';
import { ua } from '@/i18n/ua';
import { useSessionStore } from '@/stores/session';

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ready = useSessionStore((s) => s.ready);
  const user = useSessionStore((s) => s.user);

  useEffect(() => {
    if (ready && !user) {
      router.replace(loginHref(`${window.location.pathname}${window.location.search}`));
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <Stack
        spacing={2}
        sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}
        role="status"
      >
        <CircularProgress />
        <Typography color="text.secondary">{ua.guard.checking}</Typography>
      </Stack>
    );
  }
  return <>{children}</>;
}
