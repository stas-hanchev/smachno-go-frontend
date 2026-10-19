import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = { title: ua.titles.reset };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
