'use client';

import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { keyframes, styled } from '@mui/material/styles';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { cancelVenueOrder, listVenueOrders, pickupOrder } from '@/api/partner';
import type { OrderStatus, VenueOrder } from '@/api/types';
import { OrderStatusChip } from '@/components/orders/OrderStatusChip';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import { ReasonDialog } from '@/components/ui/ReasonDialog';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatPrice, formatTimeRange, kyivDateString } from '@/lib/format';
import { notify } from '@/stores/notify';
import { usePartnerStore } from '@/stores/partner';

const t = ua.partner.orders;
const STATUSES = Object.keys(ua.orders.status) as OrderStatus[];

const flash = keyframes`
  from { background-color: #94F5D4; }
  to { background-color: transparent; }
`;

const FreshRow = styled(TableRow, { name: 'SgPartnerOrders', slot: 'FreshRow' })<{
  $fresh: boolean;
}>(({ $fresh }) => ({
  animation: $fresh ? `${flash} 2.5s ease-out` : 'none',
}));

const Filters = styled('div', { name: 'SgPartnerOrders', slot: 'Filters' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  marginBottom: 20,
});

function matches(order: VenueOrder, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    order.customerName.toLowerCase().includes(q) ||
    (order.voucherCode ?? '').toLowerCase().includes(q) ||
    order.publicId.toLowerCase().includes(q) ||
    order.offerTitle.toLowerCase().includes(q)
  );
}

export default function PartnerOrdersPage() {
  const { venue, isOwner } = usePartnerVenue();
  const queryClient = useQueryClient();
  const soundEnabled = usePartnerStore((s) => s.soundEnabled);
  const [date, setDate] = useState(kyivDateString());
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [query, setQuery] = useState('');
  const [cancelling, setCancelling] = useState<VenueOrder | null>(null);

  const orders = useQuery({
    queryKey: ['partner', venue.id, 'orders', date, status || 'all'],
    queryFn: () => listVenueOrders(venue.id, date, status || undefined),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['partner', venue.id] });
  const give = useMutation({
    mutationFn: (publicId: string) => pickupOrder(venue.id, publicId),
    onSuccess: () => {
      notify.success(ua.partner.pickup.given);
      void refresh();
    },
    onError: (error) => notify.error(errorMessage(error)),
  });
  const cancel = useMutation({
    mutationFn: ({ publicId, reason }: { publicId: string; reason: string }) =>
      cancelVenueOrder(venue.id, publicId, reason),
    onSuccess: () => {
      notify.success(t.cancelled);
      setCancelling(null);
      void refresh();
    },
  });

  const items = (orders.data ?? []).filter((order) => matches(order, query.trim()));
  const filterKey = `${date}|${status}`;
  const [seen, setSeen] = useState({ data: orders.data, key: filterKey });
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  if (orders.data !== seen.data && !orders.isPlaceholderData) {
    const sameFilter = seen.key === filterKey && seen.data !== undefined;
    const before = new Set((seen.data ?? []).map((o) => o.publicId));
    setFresh(
      sameFilter
        ? new Set((orders.data ?? []).filter((o) => !before.has(o.publicId)).map((o) => o.publicId))
        : new Set(),
    );
    setSeen({ data: orders.data, key: filterKey });
  }

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={t.title}
        action={
          <FormControlLabel
            control={
              <Switch
                checked={soundEnabled}
                onChange={(e) => usePartnerStore.getState().setSoundEnabled(e.target.checked)}
              />
            }
            label={t.sound}
          />
        }
      />
      <Filters>
        <TextField
          type="date"
          label={t.date}
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          size="small"
          label={t.status}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">{t.allStatuses}</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {ua.orders.status[s]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          sx={{ flex: '1 1 220px' }}
          slotProps={{
            htmlInput: { 'aria-label': t.search },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Filters>
      {orders.isError && <Alert severity="error">{errorMessage(orders.error)}</Alert>}
      {orders.isPending ? (
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: '20px' }} />
      ) : items.length === 0 ? (
        <Typography color="text.secondary">{t.empty}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '20px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t.columns.time}</TableCell>
                <TableCell>{t.columns.customer}</TableCell>
                <TableCell>{t.columns.set}</TableCell>
                <TableCell align="right">{t.columns.quantity}</TableCell>
                <TableCell align="right">{t.columns.total}</TableCell>
                <TableCell>{t.columns.status}</TableCell>
                <TableCell>{t.columns.code}</TableCell>
                <TableCell align="right">{t.columns.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((order) => (
                <FreshRow key={order.publicId} $fresh={fresh.has(order.publicId)}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatTimeRange(order.pickupStart, order.pickupEnd)}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.offerTitle}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{order.voucherCode ?? '—'}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {order.status === 'paid' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={give.isPending}
                          onClick={() => give.mutate(order.publicId)}
                        >
                          {t.give}
                        </Button>
                        {isOwner && (
                          <Button size="small" color="error" onClick={() => setCancelling(order)}>
                            {t.cancel}
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </FreshRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ReasonDialog
        open={cancelling !== null}
        title={t.cancelTitle}
        text={t.cancelText}
        confirmLabel={t.cancel}
        pending={cancel.isPending}
        error={cancel.error ? errorMessage(cancel.error) : null}
        onConfirm={(reason) =>
          cancelling && cancel.mutate({ publicId: cancelling.publicId, reason })
        }
        onClose={() => setCancelling(null)}
      />
    </>
  );
}
