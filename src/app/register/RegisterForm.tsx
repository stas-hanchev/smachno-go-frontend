'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import * as yup from 'yup';
import { register } from '@/api/auth';
import { normalizeError } from '@/api/client';
import { updateMe } from '@/api/me';
import type { Session } from '@/api/types';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fieldState, LabeledField, PasswordField } from '@/components/auth/FormFields';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { ua } from '@/i18n/ua';
import { safeNextPath } from '@/lib/nav';
import { useSessionStore } from '@/stores/session';

const v = ua.auth.validation;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

const schema = yup.object({
  firstName: yup.string().trim().max(100, v.max(100)).required(v.firstNameRequired),
  lastName: yup.string().trim().max(100, v.max(100)),
  email: yup.string().trim().email(v.email).max(254, v.max(254)).required(v.emailRequired),
  phone: yup
    .string()
    .trim()
    .test('phone', v.phone, (value) => !value || PHONE_RE.test(value.replace(/[\s()-]/g, ''))),
  password: yup.string().min(8, v.passwordMin).max(128, v.max(128)).required(v.passwordRequired),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password')], v.passwordMismatch)
    .required(v.passwordMismatch),
  acceptTerms: yup.boolean().oneOf([true], v.terms),
});

const TwoColumns = styled('div', { name: 'SgRegisterForm', slot: 'TwoColumns' })(({ theme }) => ({
  display: 'grid',
  gap: 20,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '1fr 1fr' },
}));

export function RegisterForm() {
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
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: false,
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const session = await register({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim() || undefined,
          email: values.email.trim(),
          password: values.password,
          acceptTerms: values.acceptTerms,
        });
        useSessionStore.getState().setSession(session);
        const phone = values.phone.replace(/[\s()-]/g, '');
        if (phone) {
          try {
            useSessionStore.getState().setUser(await updateMe({ phone }));
          } catch {}
        }
        router.replace(next);
      } catch (error) {
        const normalized = normalizeError(error);
        for (const detail of normalized.details) {
          helpers.setFieldError(detail.field, detail.message);
        }
        setSubmitError(normalized.message);
      }
    },
  });

  return (
    <AuthLayout
      overline={ua.auth.registerOverline}
      title={ua.auth.registerTitle}
      subtitle={ua.auth.registerSubtitle}
    >
      <GoogleSignIn onSession={finish} onError={setSubmitError} text="signup_with" />
      <form onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TwoColumns>
            <LabeledField
              label={ua.auth.firstName}
              autoComplete="given-name"
              placeholder={ua.auth.firstNamePlaceholder}
              icon={<BadgeOutlinedIcon fontSize="small" />}
              {...formik.getFieldProps('firstName')}
              {...fieldState(formik, 'firstName')}
            />
            <LabeledField
              label={ua.auth.lastName}
              autoComplete="family-name"
              placeholder={ua.auth.lastNamePlaceholder}
              {...formik.getFieldProps('lastName')}
              {...fieldState(formik, 'lastName')}
            />
          </TwoColumns>
          <LabeledField
            label={ua.auth.email}
            type="email"
            autoComplete="email"
            placeholder={ua.auth.emailPlaceholder}
            icon={<MailOutlineIcon fontSize="small" />}
            {...formik.getFieldProps('email')}
            {...fieldState(formik, 'email')}
          />
          <LabeledField
            label={ua.auth.phone}
            type="tel"
            autoComplete="tel"
            placeholder={ua.auth.phonePlaceholder}
            icon={<PhoneOutlinedIcon fontSize="small" />}
            hint={
              <Typography variant="body2" sx={{ color: 'muted' }}>
                {ua.common.optional}
              </Typography>
            }
            {...formik.getFieldProps('phone')}
            {...fieldState(formik, 'phone')}
          />
          <TwoColumns>
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
          </TwoColumns>
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.acceptTerms}
                  onChange={(e) => void formik.setFieldValue('acceptTerms', e.target.checked)}
                  name="acceptTerms"
                />
              }
              label={
                <Typography variant="body2">
                  {ua.auth.acceptTermsPrefix}
                  <strong>{ua.auth.terms}</strong>
                  {ua.auth.and}
                  <strong>{ua.auth.privacy}</strong>
                </Typography>
              }
            />
            {formik.submitCount > 0 && formik.errors.acceptTerms && (
              <FormHelperText error>{formik.errors.acceptTerms}</FormHelperText>
            )}
          </div>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting}
            endIcon={<ArrowForwardIcon />}
          >
            {ua.auth.registerSubmit}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {ua.auth.haveAccount}{' '}
            <Link
              component={NextLink}
              href={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`}
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              {ua.auth.loginLink}
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
