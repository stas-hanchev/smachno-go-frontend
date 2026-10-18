'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as yup from 'yup';
import { login } from '@/api/auth';
import { errorMessage } from '@/api/client';
import { useAuthStore } from '@/stores/auth';

const schema = yup.object({
  email: yup.string().trim().email('Некоректний email').required('Вкажіть email'),
  password: yup.string().required('Вкажіть пароль'),
});

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      setSubmitError(null);
      try {
        useAuthStore.getState().setSession(await login(email.trim(), password));
        router.push('/');
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    },
  });

  const fieldError = (name: 'email' | 'password') =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Вхід
        </Typography>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps('email')}
              error={Boolean(fieldError('email'))}
              helperText={fieldError('email')}
            />
            <TextField
              label="Пароль"
              type="password"
              autoComplete="current-password"
              {...formik.getFieldProps('password')}
              error={Boolean(fieldError('password'))}
              helperText={fieldError('password')}
            />
            <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
              Увійти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
