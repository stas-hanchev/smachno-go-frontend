import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/LegalDocument';
import { ua } from '@/i18n/ua';

export const metadata: Metadata = {
  title: ua.titles.terms,
  description: ua.legal.terms.description,
};

export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
