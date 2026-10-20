'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { errorMessage } from '@/api/client';
import { acceptInvite } from '@/api/partner';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { ua } from '@/i18n/ua';
import { usePartnerStore } from '@/stores/partner';

const t = ua.partner.invite;

function Accept({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const started = useRef(false);
  const accept = useMutation({
    mutationFn: acceptInvite,
    onSuccess: (venue) => {
      usePartnerStore.getState().setVenueId(venue.id);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'venues'] });
    },
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    accept.mutate(token);
  }, [token, accept]);

  if (accept.isError) return <Alert severity="error">{errorMessage(accept.error)}</Alert>;
  if (!accept.data) {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }} role="status">
        <CircularProgress size={24} />
        <Typography>{t.accepting}</Typography>
      </Stack>
    );
  }
  return (
    <Stack spacing={2}>
      <Alert severity="success">{t.accepted(accept.data.name)}</Alert>
      <div>
        <Button component={NextLink} href="/partner" variant="contained" size="large">
          {t.toCabinet}
        </Button>
      </div>
    </Stack>
  );
}

export function AcceptInvite() {
  const token = useSearchParams().get('token');
  return (
    <PageMain>
      <PageContainer sx={{ maxWidth: 640 }}>
        <Typography variant="h2" component="h1" sx={{ mb: 3 }}>
          {t.title}
        </Typography>
        {token ? (
          <RequireAuth>
            <Accept token={token} />
          </RequireAuth>
        ) : (
          <Alert severity="error">{t.tokenMissing}</Alert>
        )}
      </PageContainer>
    </PageMain>
  );
}
