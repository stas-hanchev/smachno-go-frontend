'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useMutation } from '@tanstack/react-query';
import { resendVerifyEmail } from '@/api/auth';
import { errorMessage } from '@/api/client';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';
import { PageContainer } from './PageContainer';

export function VerifyEmailBanner() {
  const user = useSessionStore((s) => s.user);
  const resend = useMutation({
    mutationFn: resendVerifyEmail,
    onSuccess: () => notify.success(ua.auth.resent),
    onError: (error) => notify.error(errorMessage(error)),
  });

  if (!user || user.emailVerified) return null;

  return (
    <PageContainer sx={{ pt: 2 }}>
      <Alert
        severity="info"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => resend.mutate()}
            disabled={resend.isPending || resend.isSuccess}
          >
            {ua.auth.resend}
          </Button>
        }
      >
        {ua.auth.verifyBanner}
      </Alert>
    </PageContainer>
  );
}
