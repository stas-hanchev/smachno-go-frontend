'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { verifyEmail } from '@/api/auth';
import { errorMessage } from '@/api/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ua } from '@/i18n/ua';
import { useSessionStore } from '@/stores/session';

export function VerifyEmail() {
  const token = useSearchParams().get('token');
  const started = useRef(false);
  const verify = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      const user = useSessionStore.getState().user;
      if (user) useSessionStore.getState().setUser({ ...user, emailVerified: true });
    },
  });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  return (
    <AuthLayout title={ua.auth.verifyTitle}>
      <Stack spacing={2}>
        {!token && <Alert severity="error">{ua.auth.tokenMissing}</Alert>}
        {verify.isPending && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <CircularProgress size={24} />
            <Typography>{ua.auth.verifying}</Typography>
          </Stack>
        )}
        {verify.isError && <Alert severity="error">{errorMessage(verify.error)}</Alert>}
        {verify.isSuccess && <Alert severity="success">{ua.auth.verified}</Alert>}
        {(verify.isSuccess || verify.isError) && (
          <Button component={NextLink} href="/" variant="contained" size="large">
            {ua.auth.toCatalog}
          </Button>
        )}
      </Stack>
    </AuthLayout>
  );
}
