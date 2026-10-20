'use client';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, type ComponentType, type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useSocket } from '@/components/providers/RealtimeProvider';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { RouterLink } from '@/components/ui/RouterLink';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';

const NAV: { href: string; label: string; Icon: ComponentType<SvgIconProps> }[] = [
  { href: '/admin/applications', label: ua.admin.nav.applications, Icon: AssignmentOutlinedIcon },
  { href: '/admin/venues', label: ua.admin.nav.venues, Icon: StorefrontOutlinedIcon },
  { href: '/admin/users', label: ua.admin.nav.users, Icon: PeopleOutlineIcon },
  { href: '/admin/orders', label: ua.admin.nav.orders, Icon: ReceiptLongOutlinedIcon },
  { href: '/admin/dictionaries', label: ua.admin.nav.dictionaries, Icon: CategoryOutlinedIcon },
  { href: '/admin/settings', label: ua.admin.nav.settings, Icon: TuneOutlinedIcon },
  { href: '/admin/audit-log', label: ua.admin.nav.audit, Icon: HistoryOutlinedIcon },
];

const Layout = styled('div', { name: 'SgAdminShell', slot: 'Layout' })(({ theme }) => ({
  maxWidth: 1440,
  margin: '0 auto',
  padding: '16px 16px 48px',
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '232px minmax(0, 1fr)',
    padding: '32px 48px 64px',
  },
}));

const Nav = styled('nav', { name: 'SgAdminShell', slot: 'Nav' })(({ theme }) => ({
  display: 'flex',
  gap: 4,
  overflowX: 'auto',
  padding: 8,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    alignSelf: 'start',
    position: 'sticky',
    top: 104,
    padding: 16,
    overflowX: 'visible',
  },
}));

const NavLink = styled(RouterLink, { name: 'SgAdminShell', slot: 'NavLink' })<{
  $active: boolean;
}>(({ theme, $active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 12,
  whiteSpace: 'nowrap',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  textDecoration: 'none',
  color: $active ? theme.palette.common.white : theme.palette.text.primary,
  backgroundColor: $active ? theme.palette.primary.main : 'transparent',
  '&:hover': { backgroundColor: $active ? theme.palette.primary.main : theme.palette.mint.light },
  '& svg': { fontSize: 20 },
}));

function useAdminRealtime() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket) return;
    const onApplication = ({ businessName }: { businessName: string }) => {
      notify.info(ua.admin.applications.newApplication(businessName));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    };
    socket.on('application:new', onApplication);
    return () => {
      socket.off('application:new', onApplication);
    };
  }, [socket, queryClient]);
}

function Panel({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useAdminRealtime();
  return (
    <Layout>
      <Nav aria-label={ua.admin.title}>
        <Typography
          variant="overline"
          component="p"
          sx={{ px: 1.5, color: 'muted', display: { xs: 'none', md: 'block' } }}
        >
          {ua.admin.title}
        </Typography>
        {NAV.map(({ href, label, Icon }) => (
          <NavLink key={href} href={href} $active={pathname.startsWith(href)}>
            <Icon aria-hidden />
            {label}
          </NavLink>
        ))}
      </Nav>
      <main style={{ minWidth: 0 }}>{children}</main>
    </Layout>
  );
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useSessionStore((s) => s.user);
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return (
      <Layout sx={{ display: 'block' }}>
        <AccessDenied />
      </Layout>
    );
  }
  return <Panel>{children}</Panel>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireAdmin>{children}</RequireAdmin>
    </RequireAuth>
  );
}
