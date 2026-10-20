'use client';

import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { errorMessage } from '@/api/client';
import { listMyVenues } from '@/api/partner';
import type { OrderStatus } from '@/api/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useSocket } from '@/components/providers/RealtimeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { RouterLink } from '@/components/ui/RouterLink';
import { ua } from '@/i18n/ua';
import { playChime } from '@/lib/sound';
import { notify } from '@/stores/notify';
import { usePartnerStore } from '@/stores/partner';
import { shadows } from '@/theme/theme';
import { PartnerContext, type PartnerContextValue } from './PartnerContext';

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  ownerOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/partner', label: ua.partner.nav.today, Icon: TodayOutlinedIcon },
  { href: '/partner/pickup', label: ua.partner.nav.pickup, Icon: QrCodeScannerOutlinedIcon },
  { href: '/partner/orders', label: ua.partner.nav.orders, Icon: ReceiptLongOutlinedIcon },
  { href: '/partner/offers', label: ua.partner.nav.offers, Icon: Inventory2OutlinedIcon },
  {
    href: '/partner/settings/venue',
    label: ua.partner.nav.venue,
    Icon: StorefrontOutlinedIcon,
    ownerOnly: true,
  },
  {
    href: '/partner/settings/team',
    label: ua.partner.nav.team,
    Icon: GroupsOutlinedIcon,
    ownerOnly: true,
  },
];

const MOBILE_TABS = ['/partner', '/partner/pickup', '/partner/offers'];
export const PARTNER_TAB_BAR_HEIGHT = 72;

const Layout = styled('div', { name: 'SgPartnerShell', slot: 'Layout' })(({ theme }) => ({
  maxWidth: 1280,
  margin: '0 auto',
  padding: `16px 16px ${PARTNER_TAB_BAR_HEIGHT + 24}px`,
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '248px minmax(0, 1fr)',
    padding: '32px 64px 64px',
    gap: 32,
  },
}));

const Sidebar = styled('aside', { name: 'SgPartnerShell', slot: 'Sidebar' })(({ theme }) => ({
  display: 'none',
  alignSelf: 'start',
  position: 'sticky',
  top: 104,
  padding: 16,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { display: 'flex', flexDirection: 'column', gap: 4 },
}));

const NavLink = styled(RouterLink, { name: 'SgPartnerShell', slot: 'NavLink' })<{
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

const MobileVenue = styled('div', { name: 'SgPartnerShell', slot: 'MobileVenue' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

const TabBar = styled('nav', { name: 'SgPartnerShell', slot: 'TabBar' })(({ theme }) => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: theme.zIndex.appBar,
  height: PARTNER_TAB_BAR_HEIGHT,
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(12px)',
  borderTop: `1px solid ${theme.palette.mint.light}`,
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

const tabStyles = (active: boolean) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: 76,
    padding: '6px 12px',
    borderRadius: 9999,
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    border: 0,
    cursor: 'pointer',
    font: 'inherit',
    color: active ? '#002118' : '#3F4947',
    backgroundColor: active ? '#94F5D4' : 'transparent',
  }) as const;

function isActive(pathname: string, href: string) {
  return href === '/partner' ? pathname === '/partner' : pathname.startsWith(href);
}

function VenueSwitcher({ value }: { value: PartnerContextValue }) {
  if (value.venues.length < 2) {
    return (
      <div style={{ padding: '4px 4px 12px' }}>
        <Typography variant="overline" component="p" sx={{ color: 'muted', lineHeight: '18px' }}>
          {ua.partner.cabinet}
        </Typography>
        <Typography variant="h6" component="p">
          {value.venue.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {ua.partner.status[value.venue.status]} · {ua.partner.roles[value.venue.role]}
        </Typography>
      </div>
    );
  }
  return (
    <TextField
      select
      size="small"
      label={ua.partner.venue}
      value={value.venue.id}
      onChange={(e) => usePartnerStore.getState().setVenueId(Number(e.target.value))}
      sx={{ mb: 1.5 }}
      fullWidth
    >
      {value.venues.map((v) => (
        <MenuItem key={v.id} value={v.id}>
          {v.name} · {ua.partner.status[v.status]}
        </MenuItem>
      ))}
    </TextField>
  );
}

function useVenueRealtime(venueId: number) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const subscribe = () => socket.emit('venue:subscribe', { venueId });
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'listings'] });
    };
    const onNew = ({ status }: { publicId: string; status: OrderStatus }) => {
      refresh();
      if (status !== 'paid') return;
      notify.success(ua.partner.orders.newOrder);
      if (usePartnerStore.getState().soundEnabled) playChime();
    };
    subscribe();
    socket.on('connect', subscribe);
    socket.on('order:new', onNew);
    socket.on('order:updated', refresh);
    return () => {
      socket.off('connect', subscribe);
      socket.off('order:new', onNew);
      socket.off('order:updated', refresh);
      if (socket.connected) socket.emit('venue:unsubscribe', { venueId });
    };
  }, [socket, venueId, queryClient]);
}

function Cabinet({ value, children }: { value: PartnerContextValue; children: ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  useVenueRealtime(value.venue.id);

  const items = NAV.filter((item) => !item.ownerOnly || value.isOwner);
  if (value.isOwner && value.venue.status === 'draft') {
    items.push({
      href: '/partner/onboarding',
      label: ua.partner.nav.onboarding,
      Icon: RocketLaunchOutlinedIcon,
    });
  }
  const tabs = items.filter((item) => MOBILE_TABS.includes(item.href));
  const more = items.filter((item) => !MOBILE_TABS.includes(item.href));

  return (
    <PartnerContext.Provider value={value}>
      <Layout>
        <Sidebar aria-label={ua.partner.menu}>
          <VenueSwitcher value={value} />
          {items.map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} $active={isActive(pathname, href)}>
              <Icon aria-hidden />
              {label}
            </NavLink>
          ))}
        </Sidebar>
        <main style={{ minWidth: 0 }}>
          <MobileVenue>
            <VenueSwitcher value={value} />
          </MobileVenue>
          {value.venue.status === 'draft' &&
            value.isOwner &&
            !pathname.startsWith('/partner/onboarding') && (
              <Alert
                severity="warning"
                sx={{ mb: 3 }}
                action={
                  <Button
                    component={NextLink}
                    href="/partner/onboarding"
                    color="inherit"
                    size="small"
                  >
                    {ua.partner.draftCta}
                  </Button>
                }
              >
                {ua.partner.draftBanner}
              </Alert>
            )}
          {children}
        </main>
      </Layout>
      <TabBar aria-label={ua.partner.menu}>
        {tabs.map(({ href, label, Icon }) => (
          <NextLink key={href} href={href} style={tabStyles(isActive(pathname, href))}>
            <Icon aria-hidden sx={{ fontSize: 22 }} />
            {label}
          </NextLink>
        ))}
        <button
          type="button"
          style={tabStyles(more.some((item) => isActive(pathname, item.href)))}
          onClick={() => setMoreOpen(true)}
        >
          <MoreHorizIcon aria-hidden sx={{ fontSize: 22 }} />
          {ua.partner.nav.more}
        </button>
      </TabBar>
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        slotProps={{ paper: { sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, p: 2 } } }}
      >
        {more.map(({ href, label, Icon }) => (
          <NavLink
            key={href}
            href={href}
            $active={isActive(pathname, href)}
            onClick={() => setMoreOpen(false)}
          >
            <Icon aria-hidden />
            {label}
          </NavLink>
        ))}
      </Drawer>
    </PartnerContext.Provider>
  );
}

function VenuesGate({ children }: { children: ReactNode }) {
  const selectedId = usePartnerStore((s) => s.venueId);
  const venues = useQuery({ queryKey: ['partner', 'venues'], queryFn: listMyVenues });

  const value = useMemo<PartnerContextValue | null>(() => {
    const list = venues.data ?? [];
    const venue = list.find((v) => v.id === selectedId) ?? list[0];
    if (!venue) return null;
    return { venue, venues: list, isOwner: venue.role === 'owner' };
  }, [venues.data, selectedId]);

  if (venues.isPending) {
    return (
      <Layout>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: '20px' }} />
        <Skeleton variant="rounded" height={480} sx={{ borderRadius: '20px' }} />
      </Layout>
    );
  }
  if (venues.isError) {
    return (
      <Layout>
        <Alert severity="error">{errorMessage(venues.error)}</Alert>
      </Layout>
    );
  }
  if (!value) {
    return (
      <Layout sx={{ display: 'block' }}>
        <EmptyState
          icon={<StorefrontOutlinedIcon />}
          title={ua.partner.noVenues.title}
          text={ua.partner.noVenues.text}
          action={
            <Button component={NextLink} href="/for-business" variant="contained">
              {ua.partner.noVenues.cta}
            </Button>
          }
        />
      </Layout>
    );
  }
  return <Cabinet value={value}>{children}</Cabinet>;
}

export function PartnerShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <VenuesGate>{children}</VenuesGate>
    </RequireAuth>
  );
}
