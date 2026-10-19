'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import type { Order } from '@/api/types';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { ua } from '@/i18n/ua';
import { formatPickupWindow, formatPrice } from '@/lib/format';
import { shadows } from '@/theme/theme';
import { OrderStatusChip } from './OrderStatusChip';

const Card = styled('article', { name: 'SgOrderCard', slot: 'Card' })<{ $highlight: boolean }>(
  ({ theme, $highlight }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: $highlight ? theme.palette.mint.light : theme.palette.background.paper,
    boxShadow: shadows.card,
  }),
);

const Thumb = styled('div', { name: 'SgOrderCard', slot: 'Thumb' })(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 96,
  borderRadius: 16,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: '#DEF2EE',
  [theme.breakpoints.down('sm')]: { width: 88, height: 88 },
}));

const Line = styled('span', { name: 'SgOrderCard', slot: 'Line' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& svg': { fontSize: 16, color: theme.palette.success.main },
}));

const Actions = styled('div', { name: 'SgOrderCard', slot: 'Actions' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 8,
  minWidth: 160,
  [theme.breakpoints.down('sm')]: { flexDirection: 'row', width: '100%', '& > *': { flex: 1 } },
}));

export function OrderCard({ order, onShowQr }: { order: Order; onShowQr: (order: Order) => void }) {
  const active = order.status === 'paid' || order.status === 'pending_payment';
  return (
    <Card $highlight={order.status === 'paid'}>
      <Thumb>
        <ListingPhoto src={order.offer.photoUrl} alt={order.offer.title} />
      </Thumb>
      <div
        style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Typography variant="h5" component="h3">
            {order.venue.name}
          </Typography>
          <Typography variant="h5" component="p" sx={{ color: 'primary.dark' }}>
            {formatPrice(order.totalAmount)}
          </Typography>
        </div>
        <Typography variant="body2" color="text.secondary">
          {order.offer.title} · {ua.checkout.quantity(order.quantity)}
        </Typography>
        <div style={{ marginTop: 4 }}>
          <OrderStatusChip status={order.status} />
        </div>
        <Line>
          <AccessTimeIcon aria-hidden />
          {formatPickupWindow(order.pickupStart, order.pickupEnd)}
        </Line>
        <Line>
          <PlaceOutlinedIcon aria-hidden />
          {order.venue.address}
        </Line>
      </div>
      <Actions>
        {order.hasVoucher && (
          <Button
            variant="contained"
            startIcon={<QrCode2Icon />}
            onClick={() => onShowQr(order)}
            sx={{ bgcolor: 'primary.dark' }}
          >
            {ua.orders.showQr}
          </Button>
        )}
        {order.status === 'pending_payment' && (
          <Button component={NextLink} href={`/checkout/${order.publicId}`} variant="contained">
            {ua.orders.pay}
          </Button>
        )}
        <Button
          component={NextLink}
          href={`/orders/${order.publicId}`}
          variant={active ? 'outlined' : 'text'}
        >
          {ua.orders.details}
        </Button>
      </Actions>
    </Card>
  );
}
