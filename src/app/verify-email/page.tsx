import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { VerifyEmail } from './VerifyEmail';

export const metadata: Metadata = { title: ua.titles.verify };

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
