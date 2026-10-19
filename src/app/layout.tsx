import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ua } from '@/i18n/ua';
import { publicEnv } from '@/lib/env';
import { Providers } from './providers';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

const BRAND = `${ua.brand.first}${ua.brand.second}`;

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: ua.meta.description,
};

export const viewport: Viewport = {
  themeColor: '#0F5C56',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={manrope.variable}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
