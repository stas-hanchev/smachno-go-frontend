'use client';

import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import { useState } from 'react';
import * as yup from 'yup';
import { forgotPassword } from '@/api/auth';
import { errorMessage } from '@/api/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fieldState, LabeledField } from '@/components/auth/FormFields';
import { ua } from '@/i18n/ua';

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email(ua.auth.validation.email)
    .required(ua.auth.validation.emailRequired),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: async ({ email }) => {
      setSubmitError(null);
      try {
        await forgotPassword(email.trim());
        setSent(true);
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    },
  });

  return (
    <AuthLayout title={ua.auth.forgotTitle} subtitle={ua.auth.forgotSubtitle}>
      {sent ? (
        <Stack spacing={2}>
          <Alert severity="success">{ua.auth.forgotSent}</Alert>
          <Button component={NextLink} href="/login" variant="contained" size="large">
            {ua.auth.toLogin}
          </Button>
        </Stack>
      ) : (
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
            <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
              {ua.auth.forgotSubmit}
            </Button>
            <Link
              component={NextLink}
              href="/login"
              color="success.main"
              sx={{ fontWeight: 700, textAlign: 'center' }}
            >
              {ua.auth.toLogin}
            </Link>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
