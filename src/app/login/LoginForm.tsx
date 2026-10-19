'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import * as yup from 'yup';
import { login } from '@/api/auth';
import { errorMessage } from '@/api/client';
import type { Session } from '@/api/types';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fieldState, LabeledField, PasswordField } from '@/components/auth/FormFields';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { ua } from '@/i18n/ua';
import { safeNextPath } from '@/lib/nav';
import { useSessionStore } from '@/stores/session';

const v = ua.auth.validation;

const schema = yup.object({
  email: yup.string().trim().email(v.email).max(254, v.max(254)).required(v.emailRequired),
  password: yup.string().max(128, v.max(128)).required(v.passwordRequired),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const finish = useCallback(
    (session: Session) => {
      useSessionStore.getState().setSession(session);
      router.replace(next);
    },
    [router, next],
  );

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      setSubmitError(null);
      try {
        finish(await login(email.trim(), password));
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    },
  });

  return (
    <AuthLayout
      overline={ua.auth.loginOverline}
      title={ua.auth.loginTitle}
      subtitle={ua.auth.loginSubtitle}
    >
      <GoogleSignIn onSession={finish} onError={setSubmitError} />
      <form onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <LabeledField
            label={ua.auth.email}
            type="email"
            autoComplete="email"
            placeholder={ua.auth.emailPlaceholder}
            icon={<MailOutlineIcon fontSize="small" />}
            {...formik.getFieldProps('email')}
            {...fieldState(formik, 'email')}
          />
          <PasswordField
            label={ua.auth.password}
            autoComplete="current-password"
            placeholder={ua.auth.passwordPlaceholder}
            icon={<LockOutlinedIcon fontSize="small" />}
            hint={
              <Link
                component={NextLink}
                href="/forgot-password"
                variant="subtitle2"
                color="success.main"
              >
                {ua.auth.forgot}
              </Link>
            }
            {...formik.getFieldProps('password')}
            {...fieldState(formik, 'password')}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting}
            endIcon={<ArrowForwardIcon />}
          >
            {ua.auth.loginSubmit}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {ua.auth.noAccount}{' '}
            <Link
              component={NextLink}
              href={next === '/' ? '/register' : `/register?next=${encodeURIComponent(next)}`}
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              {ua.auth.registerLink}
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
