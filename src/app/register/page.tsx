import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = { title: ua.titles.register };

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
