'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { errorMessage } from '@/api/client';
import { getVoucher } from '@/api/orders';
import type { Order } from '@/api/types';
import { ua } from '@/i18n/ua';
import { QrVoucher } from './QrVoucher';

export function VoucherDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const voucher = useQuery({
    queryKey: ['voucher', order?.publicId],
    queryFn: () => getVoucher(order!.publicId),
    enabled: order !== null,
  });

  return (
    <Dialog open={order !== null} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {order?.venue.name}
        <br />
        <small style={{ fontWeight: 400 }}>{order?.offer.title}</small>
      </DialogTitle>
      <DialogContent>
        {voucher.isPending && <Skeleton variant="rounded" height={320} />}
        {voucher.isError && <Alert severity="error">{errorMessage(voucher.error)}</Alert>}
        {voucher.data && <QrVoucher voucher={voucher.data} size={220} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ua.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
}
