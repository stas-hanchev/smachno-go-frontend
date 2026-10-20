'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getOrder, listOrders, refundOrder } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { AdminOrderRow, OrderStatus } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterBar, SearchInput, SelectFilter } from '@/components/admin/Filters';
import { OrderStatusChip } from '@/components/orders/OrderStatusChip';
import { ReasonDialog } from '@/components/ui/ReasonDialog';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDate, formatDateTime, formatPrice, formatTimeRange } from '@/lib/format';
import { notify } from '@/stores/notify';

const t = ua.admin.orders;
const STATUSES = Object.keys(ua.orders.status) as OrderStatus[];
const REFUNDABLE: OrderStatus[] = ['paid', 'picked_up', 'no_show'];

function OrderDialog({ publicId, onClose }: { publicId: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [refunding, setRefunding] = useState(false);
  const order = useQuery({
    queryKey: ['admin', 'order', publicId],
    queryFn: () => getOrder(publicId!),
    enabled: publicId !== null,
  });
  const refund = useMutation({
    mutationFn: (reason: string) => refundOrder(publicId!, reason),
    onSuccess: () => {
      notify.success(t.refunded);
      setRefunding(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'order', publicId] });
    },
  });
  const data = order.data;

  return (
    <Dialog open={publicId !== null} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{publicId}</DialogTitle>
      <DialogContent>
        {order.isPending ? (
          <Skeleton variant="rounded" height={280} />
        ) : order.isError ? (
          <Alert severity="error">{errorMessage(order.error)}</Alert>
        ) : data ? (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <OrderStatusChip status={data.status} />
              <Typography color="text.secondary">
                {data.venue.name} · {data.offerTitle} × {data.quantity}
              </Typography>
            </Stack>
            <Typography>
              {t.customer}: <strong>{data.customer.name}</strong> · {data.customer.email}
            </Typography>
            <Typography>
              {ua.checkout.pickup}: {formatDate(data.pickupDate)},{' '}
              {formatTimeRange(data.pickupStart, data.pickupEnd)}
              {data.voucherCode && ` · ${data.voucherCode}`}
            </Typography>
            <Typography>
              {ua.checkout.total}: <strong>{formatPrice(data.totalAmount)}</strong> · {t.commission}
              : {formatPrice(data.commissionAmount)}
            </Typography>
            {data.cancelReason && <Alert severity="info">{data.cancelReason}</Alert>}
            <div>
              <Typography variant="subtitle1">{t.history}</Typography>
              {data.statusHistory.map((h) => (
                <Typography key={`${h.to}-${h.at}`} variant="body2" color="text.secondary">
                  {formatDateTime(h.at)} · {ua.orders.status[h.to]} · {h.actorType}
                  {h.note && ` · ${h.note}`}
                </Typography>
              ))}
            </div>
            <div>
              <Typography variant="subtitle1">{t.payments}</Typography>
              {data.payments.map((p) => (
                <div key={p.id}>
                  <Typography variant="body2">
                    {p.provider} · {p.providerOrderId} · {formatPrice(p.amount)} · {p.status}
                    {p.paidAt && ` · ${formatDateTime(p.paidAt)}`}
                  </Typography>
                  {p.refunds.map((r) => (
                    <Typography key={r.id} variant="caption" color="text.secondary" component="p">
                      ↩ {formatPrice(r.amount)} · {r.status} · {r.reason}
                    </Typography>
                  ))}
                </div>
              ))}
            </div>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ua.common.close}</Button>
        {data && REFUNDABLE.includes(data.status) && (
          <Button color="error" variant="contained" onClick={() => setRefunding(true)}>
            {t.refund}
          </Button>
        )}
      </DialogActions>
      <ReasonDialog
        open={refunding}
        title={t.refundTitle}
        text={t.refundText}
        confirmLabel={t.refund}
        reasonLabel={ua.admin.applications.reason}
        pending={refund.isPending}
        error={refund.error ? errorMessage(refund.error) : null}
        onConfirm={(reason) => refund.mutate(reason)}
        onClose={() => setRefunding(false)}
      />
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);

  const orders = useQuery({
    queryKey: ['admin', 'orders', { q, status, date, page, limit }],
    queryFn: () =>
      listOrders({ page, limit, q, status: status || undefined, date: date || undefined }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<AdminOrderRow>[] = [
    {
      key: 'number',
      label: t.columns.number,
      nowrap: true,
      render: (o) => (
        <>
          <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.publicId}</div>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(o.createdAt)}
          </Typography>
        </>
      ),
    },
    { key: 'customer', label: t.columns.customer, render: (o) => o.customerEmail },
    { key: 'venue', label: t.columns.venue, render: (o) => o.venue.name },
    { key: 'set', label: t.columns.set, render: (o) => `${o.offerTitle} × ${o.quantity}` },
    {
      key: 'total',
      label: t.columns.total,
      align: 'right',
      nowrap: true,
      render: (o) => formatPrice(o.totalAmount),
    },
    {
      key: 'status',
      label: t.columns.status,
      render: (o) => <OrderStatusChip status={o.status} />,
    },
    {
      key: 'pickup',
      label: t.columns.pickup,
      nowrap: true,
      render: (o) => `${formatDate(o.pickupDate)}${o.voucherCode ? ` · ${o.voucherCode}` : ''}`,
    },
  ];

  return (
    <>
      <SectionHeading level="h1" size="medium" title={ua.admin.nav.orders} />
      <FilterBar>
        <SearchInput
          value={q}
          placeholder={t.search}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
        />
        <SelectFilter
          label={ua.admin.status}
          value={status}
          options={STATUSES.map((s) => ({ value: s, label: ua.orders.status[s] }))}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <TextField
          type="date"
          size="small"
          label={t.date}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={orders.data?.data}
        rowKey={(o) => o.publicId}
        loading={orders.isPending}
        error={orders.error}
        total={orders.data?.meta.total}
        page={page}
        limit={limit}
        onPage={setPage}
        onLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onRowClick={(o) => setSelected(o.publicId)}
      />
      <OrderDialog key={selected ?? 'none'} publicId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
