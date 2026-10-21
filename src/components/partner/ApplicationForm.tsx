'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import { useState } from 'react';
import * as yup from 'yup';
import { register } from '@/api/auth';
import { normalizeError } from '@/api/client';
import { submitApplication } from '@/api/partner';
import { fieldState, PasswordField } from '@/components/auth/FormFields';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';

const t = ua.forBusiness;
const v = t.validation;
const DRAFT_KEY = 'sg-application-draft';
const PHONE = /^\+[1-9]\d{7,14}$/;

const Two = styled('div', { name: 'SgApplicationForm', slot: 'Two' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '1fr 1fr' },
}));

interface Values {
  firstName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  businessName: string;
  venueType: string;
  address: string;
  venuesCount: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  legalName: string;
  taxId: string;
  iban: string;
}

const EMPTY: Values = {
  firstName: '',
  email: '',
  password: '',
  acceptTerms: false,
  businessName: '',
  venueType: t.venueTypes[0]!,
  address: '',
  venuesCount: 1,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  legalName: '',
  taxId: '',
  iban: '',
};

function loadDraft(): Partial<Values> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Values>) : {};
  } catch {
    return {};
  }
}

function saveDraft(values: Values) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, password: undefined }));
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

const businessSchema = {
  businessName: yup.string().trim().min(2, v.min(2)).max(255).required(v.required),
  venueType: yup.string().required(v.required),
  address: yup.string().trim().min(5, v.min(5)).max(255).required(v.required),
  venuesCount: yup.number().integer().min(1).max(500).required(v.required),
  contactName: yup.string().trim().min(2, v.min(2)).max(255).required(v.required),
  contactPhone: yup
    .string()
    .trim()
    .transform((value: string) => value.replace(/[\s()-]/g, ''))
    .matches(PHONE, ua.auth.validation.phone)
    .required(v.required),
  contactEmail: yup.string().trim().email(ua.auth.validation.email).required(v.required),
  legalName: yup.string().trim().min(2, v.min(2)).max(255).required(v.required),
  taxId: yup
    .string()
    .trim()
    .matches(/^(\d{8}|\d{10})$/, v.taxId)
    .required(v.required),
  iban: yup
    .string()
    .transform((value: string) => value.replace(/\s+/g, '').toUpperCase())
    .matches(/^UA\d{27}$/, v.iban)
    .required(v.required),
};

const guestSchema = yup.object({
  ...businessSchema,
  firstName: yup.string().trim().max(100).required(ua.auth.validation.firstNameRequired),
  email: yup
    .string()
    .trim()
    .email(ua.auth.validation.email)
    .required(ua.auth.validation.emailRequired),
  password: yup
    .string()
    .min(8, ua.auth.validation.passwordMin)
    .required(ua.auth.validation.passwordRequired),
  acceptTerms: yup.boolean().oneOf([true], ua.auth.validation.terms),
});

export function ApplicationForm({ onSubmitted }: { onSubmitted: () => void }) {
  const queryClient = useQueryClient();
  const user = useSessionStore((s) => s.user);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const formik = useFormik<Values>({
    initialValues: {
      ...EMPTY,
      contactEmail: user?.email ?? '',
      contactName: user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '',
      contactPhone: user?.phone ?? '',
      ...loadDraft(),
    },
    validationSchema: user ? yup.object(businessSchema) : guestSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      setNeedsVerification(false);
      saveDraft(values);
      try {
        if (!useSessionStore.getState().user) {
          useSessionStore.getState().setSession(
            await register({
              firstName: values.firstName.trim(),
              email: values.email.trim(),
              password: values.password,
              acceptTerms: values.acceptTerms,
            }),
          );
        }
        await submitApplication({
          businessName: values.businessName.trim(),
          venueType: values.venueType,
          address: values.address.trim(),
          venuesCount: values.venuesCount,
          contactName: values.contactName.trim(),
          contactPhone: values.contactPhone.replace(/[\s()-]/g, ''),
          contactEmail: values.contactEmail.trim(),
          legalName: values.legalName.trim(),
          taxId: values.taxId.trim(),
          iban: values.iban.replace(/\s+/g, '').toUpperCase(),
        });
        clearDraft();
        notify.success(t.submitted);
        void queryClient.invalidateQueries({ queryKey: ['partner', 'applications'] });
        onSubmitted();
      } catch (error) {
        const normalized = normalizeError(error);
        if (normalized.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
          return;
        }
        normalized.details.forEach((d) => helpers.setFieldError(d.field, d.message));
        setSubmitError(normalized.message);
      }
    },
  });

  const field = (name: keyof Values) => ({
    ...formik.getFieldProps(name),
    ...fieldState(formik, name),
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}
        {(needsVerification || (user && !user.emailVerified)) && (
          <Alert severity="info">{t.verifyFirst}</Alert>
        )}
        {!user && (
          <Stack spacing={2}>
            <Typography variant="h5" component="h3">
              {t.account}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.accountHint}{' '}
              <Link component={NextLink} href="/login?next=%2Ffor-business" color="success.main">
                {t.login}
              </Link>
            </Typography>
            <Two>
              <TextField
                label={ua.auth.firstName}
                autoComplete="given-name"
                {...field('firstName')}
              />
              <TextField
                label={ua.auth.email}
                type="email"
                autoComplete="email"
                {...field('email')}
              />
            </Two>
            <PasswordField
              label={ua.auth.password}
              autoComplete="new-password"
              placeholder={ua.auth.passwordMin}
              {...field('password')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.acceptTerms}
                  onChange={(e) => void formik.setFieldValue('acceptTerms', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {ua.auth.acceptTermsPrefix}
                  <Link href="/terms" target="_blank" rel="noopener">
                    {ua.auth.terms}
                  </Link>
                  {ua.auth.and}
                  <Link href="/privacy" target="_blank" rel="noopener">
                    {ua.auth.privacy}
                  </Link>
                </Typography>
              }
            />
            {formik.submitCount > 0 && formik.errors.acceptTerms && (
              <Typography variant="caption" color="error">
                {formik.errors.acceptTerms}
              </Typography>
            )}
          </Stack>
        )}
        <Stack spacing={2}>
          <Typography variant="h5" component="h3">
            {t.business}
          </Typography>
          <TextField label={t.businessName} {...field('businessName')} />
          <Two>
            <TextField select label={t.venueType} {...field('venueType')}>
              {t.venueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label={t.venuesCount}
              {...field('venuesCount')}
              slotProps={{ htmlInput: { min: 1, max: 500 } }}
            />
          </Two>
          <TextField label={t.address} {...field('address')} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h5" component="h3">
            {t.contact}
          </Typography>
          <TextField label={t.contactName} {...field('contactName')} />
          <Two>
            <TextField
              label={t.contactPhone}
              type="tel"
              placeholder="+380XXXXXXXXX"
              {...field('contactPhone')}
            />
            <TextField label={t.contactEmail} type="email" {...field('contactEmail')} />
          </Two>
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h5" component="h3">
            {t.legal}
          </Typography>
          <TextField label={t.legalName} {...field('legalName')} />
          <Two>
            <TextField label={t.taxId} inputMode="numeric" {...field('taxId')} />
            <TextField label={t.iban} placeholder="UA…" {...field('iban')} />
          </Two>
        </Stack>
        <div>
          <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
            {t.submit}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
