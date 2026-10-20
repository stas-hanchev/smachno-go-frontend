import type { Metadata } from 'next';
import { ua } from '@/i18n/ua';
import { ForBusinessView } from './ForBusinessView';

export const metadata: Metadata = {
  title: ua.titles.forBusiness,
  description: ua.forBusiness.heroText,
};

export default function ForBusinessPage() {
  return <ForBusinessView />;
}
