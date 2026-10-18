import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'СмачноGo', template: '%s · СмачноGo' },
  description: 'Смачна їжа зі знижкою від закладів поруч, замість того щоб її викинули.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={inter.variable}>
      <body>
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
