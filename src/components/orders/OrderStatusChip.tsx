'use client';

import { styled } from '@mui/material/styles';
import type { OrderStatus } from '@/api/types';
import { ua } from '@/i18n/ua';

const TONES: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: '#FFF4D6', fg: '#7A5200' },
  paid: { bg: '#94F5D4', fg: '#002118' },
  picked_up: { bg: '#E3F8F3', fg: '#006B54' },
  cancelled_by_customer: { bg: '#ECEFEE', fg: '#3F4947' },
  cancelled_by_venue: { bg: '#FDECEA', fg: '#C62828' },
  expired: { bg: '#ECEFEE', fg: '#3F4947' },
  no_show: { bg: '#FDECEA', fg: '#C62828' },
  refunded: { bg: '#ECEFEE', fg: '#3F4947' },
};

const Chip = styled('span', { name: 'SgOrderStatusChip', slot: 'Chip' })<{
  $bg: string;
  $fg: string;
}>(({ $bg, $fg }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 9999,
  backgroundColor: $bg,
  color: $fg,
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}));

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const tone = TONES[status];
  return (
    <Chip $bg={tone.bg} $fg={tone.fg}>
      {ua.orders.status[status]}
    </Chip>
  );
}
