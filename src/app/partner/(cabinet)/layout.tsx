import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PartnerShell } from '@/components/partner/PartnerShell';
import { ua } from '@/i18n/ua';

export const metadata: Metadata = { title: ua.titles.partner };

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
