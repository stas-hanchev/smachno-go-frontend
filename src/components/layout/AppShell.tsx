'use client';

import { styled } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isCabinetPath } from '@/lib/nav';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';
import { MobileTabBar, TAB_BAR_HEIGHT } from './MobileTabBar';
import { VerifyEmailBanner } from './VerifyEmailBanner';

const Root = styled('div', { name: 'SgAppShell', slot: 'Root' })(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  paddingBottom: TAB_BAR_HEIGHT,
  [theme.breakpoints.up('md')]: { paddingBottom: 0 },
}));

const CabinetRoot = styled(Root, { name: 'SgAppShell', slot: 'CabinetRoot' })({ paddingBottom: 0 });

const Content = styled('div', { name: 'SgAppShell', slot: 'Content' })({ flex: '1 0 auto' });

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isCabinetPath(pathname)) {
    return (
      <CabinetRoot>
        <AppHeader />
        <VerifyEmailBanner />
        <Content>{children}</Content>
      </CabinetRoot>
    );
  }
  return (
    <Root>
      <AppHeader />
      <VerifyEmailBanner />
      <Content>{children}</Content>
      <Footer />
      <MobileTabBar />
    </Root>
  );
}
