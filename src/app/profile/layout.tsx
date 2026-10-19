import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ProfileShell } from '@/components/profile/ProfileShell';
import { ua } from '@/i18n/ua';

export const metadata: Metadata = { title: ua.titles.profile };

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}
