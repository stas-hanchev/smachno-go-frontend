'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { RouterLink } from '@/components/ui/RouterLink';
import { useCities } from '@/hooks/useSearchArea';
import { useLogout } from '@/hooks/useLogout';
import { ua } from '@/i18n/ua';
import { fullName, initials } from '@/lib/user';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';

const Header = styled('section', { name: 'SgProfileShell', slot: 'Header' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 20,
  padding: 24,
  marginBottom: 24,
  borderRadius: 24,
  background: `linear-gradient(120deg, ${theme.palette.secondary.main} 0%, ${theme.palette.mint.light} 60%, #FFFFFF 100%)`,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { padding: 32 },
}));

const Meta = styled('div', { name: 'SgProfileShell', slot: 'Meta' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  marginTop: 4,
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& span': { display: 'inline-flex', alignItems: 'center', gap: 4 },
  '& svg': { fontSize: 16 },
}));

const Layout = styled('div', { name: 'SgProfileShell', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: '280px minmax(0, 1fr)', gap: 32 },
}));

const Menu = styled('nav', { name: 'SgProfileShell', slot: 'Menu' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const MenuLink = styled(RouterLink, { name: 'SgProfileShell', slot: 'MenuLink' })<{
  $active: boolean;
}>(({ theme, $active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 12,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  textDecoration: 'none',
  color: $active ? theme.palette.common.white : theme.palette.text.primary,
  backgroundColor: $active ? theme.palette.primary.main : 'transparent',
  '&:hover': { backgroundColor: $active ? theme.palette.primary.main : theme.palette.mint.light },
  '& svg': { fontSize: 20 },
}));

const SideInfo = styled('div', { name: 'SgProfileShell', slot: 'SideInfo' })(({ theme }) => ({
  marginTop: 16,
  padding: 20,
  borderRadius: 20,
  backgroundColor: theme.palette.mint.light,
  '& svg': { color: theme.palette.success.main },
}));

const MENU = [
  { href: '/profile', label: ua.nav.profile, Icon: EditOutlinedIcon },
  { href: '/orders', label: ua.profile.menuOrders, Icon: ReceiptLongOutlinedIcon },
  { href: '/favorites', label: ua.profile.menuFavorites, Icon: FavoriteBorderIcon },
  {
    href: '/profile/notifications',
    label: ua.profile.menuNotifications,
    Icon: NotificationsNoneOutlinedIcon,
  },
  { href: '/profile/settings', label: ua.profile.menuSecurity, Icon: ShieldOutlinedIcon },
];

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user)!;
  const cities = useCities();
  const logout = useLogout();
  const city = cities.data?.find((c) => c.id === user.cityId);

  return (
    <>
      <Header>
        <Avatar
          src={user.avatarUrl ?? undefined}
          sx={{ width: 88, height: 88, bgcolor: 'primary.dark', fontSize: 32, fontWeight: 800 }}
        >
          {initials(user.firstName, user.lastName)}
        </Avatar>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <Typography variant="h2" component="h1">
            {fullName(user.firstName, user.lastName)}
          </Typography>
          <Meta>
            <span>
              <MailOutlineIcon aria-hidden />
              {user.email}
              {!user.emailVerified && ` · ${ua.profile.emailUnverified}`}
            </span>
            <span>
              <PlaceOutlinedIcon aria-hidden />
              {user.homeAddress ?? city?.name ?? ua.profile.notSet}
            </span>
          </Meta>
        </div>
        <Button
          component={NextLink}
          href="/profile/settings"
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          sx={{ bgcolor: 'primary.dark' }}
        >
          {ua.profile.edit}
        </Button>
      </Header>
      <Layout>
        <aside>
          <Menu aria-label={ua.profile.cabinet}>
            <Typography variant="overline" sx={{ px: 1.5, color: 'muted' }}>
              {ua.profile.cabinet}
            </Typography>
            {MENU.map(({ href, label, Icon }) => (
              <MenuLink key={href} href={href} $active={pathname === href}>
                <Icon aria-hidden />
                {label}
              </MenuLink>
            ))}
            <Button
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => void logout()}
              sx={{ justifyContent: 'flex-start', px: 1.5, mt: 1 }}
            >
              {ua.profile.logout}
            </Button>
          </Menu>
          <SideInfo>
            <PaymentsOutlinedIcon aria-hidden />
            <Typography variant="subtitle2">{ua.profile.paymentsTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {ua.profile.paymentsText}
            </Typography>
          </SideInfo>
        </aside>
        <div>{children}</div>
      </Layout>
    </>
  );
}

export function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <PageMain>
      <PageContainer>
        <RequireAuth>
          <Shell>{children}</Shell>
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
