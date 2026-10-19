import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ua } from '@/i18n/ua';

export const metadata: Metadata = { title: ua.titles.map };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
