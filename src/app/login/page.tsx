import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: ua.titles.login };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
