'use client';

import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import { usePathname } from 'next/navigation';
import { ua } from '@/i18n/ua';
import { isActivePath } from '@/lib/nav';

export const TAB_BAR_HEIGHT = 72;

const TABS = [
  { href: '/', label: ua.nav.explore, Icon: ExploreOutlinedIcon, match: ['/', '/search', '/map'] },
  {
    href: '/orders',
    label: ua.nav.orders,
    Icon: ShoppingBagOutlinedIcon,
    match: ['/orders', '/checkout'],
  },
  {
    href: '/profile',
    label: ua.nav.profile,
    Icon: PersonOutlineIcon,
    match: ['/profile', '/favorites'],
  },
];

const Bar = styled('nav', { name: 'SgMobileTabBar', slot: 'Bar' })(({ theme }) => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: theme.zIndex.appBar,
  height: TAB_BAR_HEIGHT,
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(12px)',
  borderTop: `1px solid ${theme.palette.mint.light}`,
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

const Tab = styled(RouterLink, { name: 'SgMobileTabBar', slot: 'Tab' })<{ $active: boolean }>(
  ({ theme, $active }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    minWidth: 92,
    padding: '6px 16px',
    borderRadius: 9999,
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 700,
    textDecoration: 'none',
    color: $active ? theme.palette.mint.contrastText : theme.palette.text.secondary,
    backgroundColor: $active ? theme.palette.secondary.main : 'transparent',
    '& svg': { fontSize: 22 },
  }),
);

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <Bar aria-label={ua.nav.mainMenu}>
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match.some((m) => isActivePath(pathname, m));
        return (
          <Tab key={href} href={href} $active={active} aria-current={active ? 'page' : undefined}>
            <Icon aria-hidden />
            {label}
          </Tab>
        );
      })}
    </Bar>
  );
}
