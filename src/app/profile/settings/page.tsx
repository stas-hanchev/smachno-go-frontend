'use client';

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { logoutAll } from '@/api/auth';
import { normalizeError } from '@/api/client';
import { changePassword, updateMe } from '@/api/me';
import type { User } from '@/api/types';
import { fieldState, LabeledField, PasswordField } from '@/components/auth/FormFields';
import { ProfilePanel } from '@/components/profile/ProfilePanel';
import { useLogout } from '@/hooks/useLogout';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';

const v = ua.auth.validation;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

const TwoColumns = styled('div', { name: 'SgProfileSettings', slot: 'TwoColumns' })(
  ({ theme }) => ({
    display: 'grid',
    gap: 20,
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('sm')]: { gridTemplateColumns: '1fr 1fr' },
  }),
);

const profileSchema = yup.object({
  firstName: yup.string().trim().max(100, v.max(100)).required(v.firstNameRequired),
  lastName: yup.string().trim().max(100, v.max(100)),
  phone: yup
    .string()
    .trim()
    .test('phone', v.phone, (value) => !value || PHONE_RE.test(value.replace(/[\s()-]/g, ''))),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required(v.passwordRequired),
  newPassword: yup.string().min(8, v.passwordMin).max(128, v.max(128)).required(v.passwordRequired),
  confirm: yup
    .string()
    .oneOf([yup.ref('newPassword')], v.passwordMismatch)
    .required(v.passwordMismatch),
});

function PersonalForm({ user }: { user: User }) {
  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values, helpers) => {
      try {
        const phone = values.phone.replace(/[\s()-]/g, '');
        const updated = await updateMe({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim() || null,
          phone: phone || null,
        });
        useSessionStore.getState().setUser(updated);
        notify.success(ua.common.saved);
      } catch (error) {
        const normalized = normalizeError(error);
        normalized.details.forEach((d) => helpers.setFieldError(d.field, d.message));
        helpers.setStatus(normalized.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {typeof formik.status === 'string' && <Alert severity="error">{formik.status}</Alert>}
        <TwoColumns>
          <LabeledField
            label={ua.profile.firstName}
            autoComplete="given-name"
            icon={<BadgeOutlinedIcon fontSize="small" />}
            {...formik.getFieldProps('firstName')}
            {...fieldState(formik, 'firstName')}
          />
          <LabeledField
            label={ua.profile.lastName}
            autoComplete="family-name"
            {...formik.getFieldProps('lastName')}
            {...fieldState(formik, 'lastName')}
          />
        </TwoColumns>
        <TwoColumns>
          <LabeledField
            label={ua.profile.phone}
            type="tel"
            autoComplete="tel"
            placeholder={ua.profile.phonePlaceholder}
            icon={<PhoneOutlinedIcon fontSize="small" />}
            {...formik.getFieldProps('phone')}
            {...fieldState(formik, 'phone')}
          />
          <LabeledField
            label={ua.profile.email}
            name="email"
            value={user.email}
            disabled
            icon={<MailOutlineIcon fontSize="small" />}
          />
        </TwoColumns>
        <div>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting || !formik.dirty}>
            {ua.common.save}
          </Button>
        </div>
      </Stack>
    </form>
  );
}

function PasswordForm() {
  const formik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirm: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      try {
        await changePassword(values.currentPassword, values.newPassword);
        helpers.resetForm();
        notify.success(ua.profile.passwordChanged);
      } catch (error) {
        const normalized = normalizeError(error);
        normalized.details.forEach((d) => helpers.setFieldError(d.field, d.message));
        helpers.setStatus(normalized.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {typeof formik.status === 'string' && <Alert severity="error">{formik.status}</Alert>}
        <PasswordField
          label={ua.profile.currentPassword}
          autoComplete="current-password"
          icon={<LockOutlinedIcon fontSize="small" />}
          {...formik.getFieldProps('currentPassword')}
          {...fieldState(formik, 'currentPassword')}
        />
        <TwoColumns>
          <PasswordField
            label={ua.profile.newPassword}
            autoComplete="new-password"
            placeholder={ua.auth.passwordMin}
            icon={<LockResetOutlinedIcon fontSize="small" />}
            {...formik.getFieldProps('newPassword')}
            {...fieldState(formik, 'newPassword')}
          />
          <PasswordField
            label={ua.auth.passwordConfirm}
            autoComplete="new-password"
            placeholder={ua.auth.passwordConfirmPlaceholder}
            {...formik.getFieldProps('confirm')}
            {...fieldState(formik, 'confirm')}
          />
        </TwoColumns>
        <div>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {ua.profile.changePassword}
          </Button>
        </div>
      </Stack>
    </form>
  );
}

export default function ProfileSettingsPage() {
  const user = useSessionStore((s) => s.user);
  const logout = useLogout();
  if (!user) return null;

  return (
    <Stack spacing={3}>
      <ProfilePanel title={ua.profile.personalTitle}>
        <PersonalForm key={user.id} user={user} />
      </ProfilePanel>
      <ProfilePanel title={ua.profile.passwordTitle}>
        <PasswordForm />
      </ProfilePanel>
      <ProfilePanel title={ua.profile.sessionsTitle}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {ua.profile.sessionsText}
        </Typography>
        <Button color="error" variant="outlined" onClick={() => void logout(logoutAll)}>
          {ua.profile.logoutAll}
        </Button>
      </ProfilePanel>
    </Stack>
  );
}
