import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/LegalDocument';
import { ua } from '@/i18n/ua';

export const metadata: Metadata = {
  title: ua.titles.privacy,
  description: ua.legal.privacy.description,
};

export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
