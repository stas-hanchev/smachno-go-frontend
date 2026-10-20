import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { AcceptInvite } from './AcceptInvite';

export const metadata: Metadata = { title: ua.titles.invite };

export default function InvitePage() {
  return (
    <Suspense>
      <AcceptInvite />
    </Suspense>
  );
}
