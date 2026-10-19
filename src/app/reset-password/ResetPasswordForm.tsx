'use client';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import * as yup from 'yup';
import { resetPassword } from '@/api/auth';
import { errorMessage } from '@/api/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fieldState, PasswordField } from '@/components/auth/FormFields';
import { ua } from '@/i18n/ua';

const v = ua.auth.validation;

const schema = yup.object({
  password: yup.string().min(8, v.passwordMin).max(128, v.max(128)).required(v.passwordRequired),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password')], v.passwordMismatch)
    .required(v.passwordMismatch),
});

export function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { password: '', passwordConfirm: '' },
    validationSchema: schema,
    onSubmit: async ({ password }) => {
      if (!token) return;
      setSubmitError(null);
      try {
        await resetPassword(token, password);
        setDone(true);
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    },
  });

  return (
    <AuthLayout title={ua.auth.resetTitle} subtitle={ua.auth.resetSubtitle}>
      {!token ? (
        <Alert severity="error">{ua.auth.tokenMissing}</Alert>
      ) : done ? (
        <Stack spacing={2}>
          <Alert severity="success">{ua.auth.resetDone}</Alert>
          <Button component={NextLink} href="/login" variant="contained" size="large">
            {ua.auth.toLogin}
          </Button>
        </Stack>
      ) : (
        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <PasswordField
              label={ua.auth.password}
              autoComplete="new-password"
              placeholder={ua.auth.passwordMin}
              icon={<LockOutlinedIcon fontSize="small" />}
              {...formik.getFieldProps('password')}
              {...fieldState(formik, 'password')}
            />
            <PasswordField
              label={ua.auth.passwordConfirm}
              autoComplete="new-password"
              placeholder={ua.auth.passwordConfirmPlaceholder}
              icon={<LockResetOutlinedIcon fontSize="small" />}
              {...formik.getFieldProps('passwordConfirm')}
              {...fieldState(formik, 'passwordConfirm')}
            />
            <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
              {ua.auth.resetSubmit}
            </Button>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
