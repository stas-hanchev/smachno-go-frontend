'use client';

import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { listOrders } from '@/api/orders';
import type { Order } from '@/api/types';
import { OrderCard } from '@/components/orders/OrderCard';
import { VoucherDialog } from '@/components/orders/VoucherDialog';
import { ProfilePanel } from '@/components/profile/ProfilePanel';
import { PillBadge } from '@/components/ui/Badges';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { useSessionStore } from '@/stores/session';

export default function ProfilePage() {
  const user = useSessionStore((s) => s.user);
  const { label, radiusKm } = useSearchArea();
  const [qrOrder, setQrOrder] = useState<Order | null>(null);
  const active = useQuery({ queryKey: ['orders', 'active'], queryFn: () => listOrders('active') });

  return (
    <Stack spacing={3}>
      <ProfilePanel
        title={ua.profile.activeOrdersTitle}
        subtitle={ua.profile.activeOrdersSubtitle}
        action={active.data && <PillBadge>{ua.profile.activeCount(active.data.length)}</PillBadge>}
      >
        {active.isPending && (
          <Skeleton variant="rounded" height={136} sx={{ borderRadius: '24px' }} />
        )}
        {active.isError && <Alert severity="error">{errorMessage(active.error)}</Alert>}
        {active.data?.length === 0 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography color="text.secondary">{ua.profile.noActive}</Typography>
            <Button component={NextLink} href="/search" variant="contained">
              {ua.orders.find}
            </Button>
          </Stack>
        )}
        <Stack spacing={2}>
          {active.data?.map((order) => (
            <OrderCard key={order.publicId} order={order} onShowQr={setQrOrder} />
          ))}
        </Stack>
      </ProfilePanel>

      <ProfilePanel
        title={ua.profile.defaultLocation}
        action={
          <Button
            component={NextLink}
            href="/location"
            variant="outlined"
            startIcon={<PlaceOutlinedIcon />}
          >
            {ua.home.changeLocation}
          </Button>
        }
      >
        <Typography>
          {user?.homeAddress ?? label ?? ua.profile.notSet} · {ua.common.km(radiusKm)}
        </Typography>
      </ProfilePanel>

      <VoucherDialog order={qrOrder} onClose={() => setQrOrder(null)} />
    </Stack>
  );
}
