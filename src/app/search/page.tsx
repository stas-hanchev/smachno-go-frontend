import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ua } from '@/i18n/ua';
import { SearchView } from './SearchView';

export const metadata: Metadata = { title: ua.titles.search };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
