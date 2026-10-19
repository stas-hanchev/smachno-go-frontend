'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { Order } from '@/api/types';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { ua } from '@/i18n/ua';
import { formatPickupWindow, formatPrice } from '@/lib/format';

const Thumb = styled('div', { name: 'SgOrderSummary', slot: 'Thumb' })({
  position: 'relative',
  width: 88,
  height: 88,
  borderRadius: 16,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: '#DEF2EE',
});

const Line = styled('div', { name: 'SgOrderSummary', slot: 'Line' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& svg': { fontSize: 18, color: theme.palette.success.main },
}));

const Row = styled('div', { name: 'SgOrderSummary', slot: 'Row' })({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
});

export function OrderSummary({ order }: { order: Order }) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Thumb>
          <ListingPhoto src={order.offer.photoUrl} alt={order.offer.title} />
        </Thumb>
        <div style={{ minWidth: 0 }}>
          <Typography variant="h5" component="p">
            {order.offer.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.venue.name} · {ua.checkout.quantity(order.quantity)}
          </Typography>
        </div>
      </Stack>
      <Line>
        <AccessTimeIcon aria-hidden />
        {ua.checkout.pickup}: {formatPickupWindow(order.pickupStart, order.pickupEnd)}
      </Line>
      <Line>
        <PlaceOutlinedIcon aria-hidden />
        {order.venue.address}
      </Line>
      <Divider />
      <Row>
        <Typography variant="body2" color="text.secondary">
          {ua.order.unitPrice}
        </Typography>
        <Typography variant="body2">
          <s style={{ color: '#6F7977', marginRight: 8 }}>{formatPrice(order.unitOriginalPrice)}</s>
          {formatPrice(order.unitPrice)}
        </Typography>
      </Row>
      <Row>
        <Typography variant="body2" color="text.secondary">
          {ua.checkout.saving}
        </Typography>
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
          −{formatPrice(order.savingAmount)}
        </Typography>
      </Row>
      <Row>
        <Typography variant="h5" component="p">
          {ua.checkout.total}
        </Typography>
        <Typography variant="h4" component="p" sx={{ color: 'primary.dark' }}>
          {formatPrice(order.totalAmount)}
        </Typography>
      </Row>
    </Stack>
  );
}
