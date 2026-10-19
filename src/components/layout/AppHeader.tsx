'use client';

import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { RouterLink } from '@/components/ui/RouterLink';
import { usePathname } from 'next/navigation';
import { ua } from '@/i18n/ua';
import { isActivePath } from '@/lib/nav';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';
import { HeaderSearch } from './HeaderSearch';
import { LocationChip } from './LocationChip';
import { Logo } from './Logo';
import { NotificationsButton } from './NotificationsButton';
import { UserMenu } from './UserMenu';

const NAV = [
  { href: '/', label: ua.nav.home },
  { href: '/search', label: ua.nav.venues },
  { href: '/map', label: ua.nav.map },
  { href: '/orders', label: ua.nav.orders },
  { href: '/favorites', label: ua.nav.favorites },
];

const Bar = styled('header', { name: 'SgAppHeader', slot: 'Bar' })(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: shadows.header,
}));

const Inner = styled('div', { name: 'SgAppHeader', slot: 'Inner' })(({ theme }) => ({
  maxWidth: 1280,
  margin: '0 auto',
  height: 64,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  [theme.breakpoints.up('md')]: { height: 80, padding: '0 64px', gap: 24 },
}));

const DesktopOnly = styled('div', { name: 'SgAppHeader', slot: 'DesktopOnly' })(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: 8,
  [theme.breakpoints.up('md')]: { display: 'flex' },
}));

const MobileOnly = styled('div', { name: 'SgAppHeader', slot: 'MobileOnly' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginLeft: 'auto',
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

const Nav = styled('nav', { name: 'SgAppHeader', slot: 'Nav' })(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: 4,
  marginLeft: 'auto',
  [theme.breakpoints.up('md')]: { display: 'flex' },
}));

const NavLink = styled(RouterLink, { name: 'SgAppHeader', slot: 'NavLink' })<{ $active: boolean }>(
  ({ theme, $active }) => ({
    padding: '8px 14px',
    borderRadius: 9999,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    color: $active ? theme.palette.mint.contrastText : theme.palette.text.secondary,
    backgroundColor: $active ? theme.palette.secondary.main : 'transparent',
    transition: 'background-color 150ms',
    '&:hover': {
      backgroundColor: $active ? theme.palette.secondary.main : theme.palette.mint.light,
    },
  }),
);

export function AppHeader() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);

  return (
    <Bar>
      <Inner>
        <Logo size="large" />
        <DesktopOnly>
          <LocationChip />
        </DesktopOnly>
        <DesktopOnly sx={{ flex: '1 1 auto', maxWidth: 320 }}>
          <HeaderSearch />
        </DesktopOnly>
        <Nav aria-label={ua.nav.mainMenu}>
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} $active={isActivePath(pathname, item.href)}>
              {item.label}
            </NavLink>
          ))}
        </Nav>
        <DesktopOnly>
          {user && <NotificationsButton />}
          <UserMenu />
        </DesktopOnly>
        <MobileOnly>
          <IconButton component={Link} href="/location" aria-label={ua.location.chip}>
            <PlaceOutlinedIcon sx={{ color: 'text.primary' }} />
          </IconButton>
          {user && <NotificationsButton />}
          <UserMenu />
        </MobileOnly>
      </Inner>
    </Bar>
  );
}
