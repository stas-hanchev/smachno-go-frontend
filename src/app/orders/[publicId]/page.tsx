'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { cancelOrder, getOrder } from '@/api/orders';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { OrderStatusChip } from '@/components/orders/OrderStatusChip';
import { OrderSummary } from '@/components/orders/OrderSummary';
import { QrVoucher } from '@/components/orders/QrVoucher';
import { ua } from '@/i18n/ua';
import { directionsUrl, formatDateTime } from '@/lib/format';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';

const Layout = styled('div', { name: 'SgOrderDetails', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32 },
}));

const Panel = styled('section', { name: 'SgOrderDetails', slot: 'Panel' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Timeline = styled('ol', { name: 'SgOrderDetails', slot: 'Timeline' })(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  '& li': {
    position: 'relative',
    paddingLeft: 24,
    fontSize: 14,
    lineHeight: '20px',
  },
  '& li::before': {
    content: '""',
    position: 'absolute',
    left: 4,
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: theme.palette.success.main,
  },
  '& time': { display: 'block', color: theme.palette.muted, fontSize: 12 },
}));

const CANCELLABLE = new Set(['pending_payment', 'paid']);

function OrderDetails() {
  const { publicId } = useParams<{ publicId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const returnedFromPayment = searchParams.get('payment') === 'return';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState('');

  const order = useQuery({
    queryKey: ['order', publicId],
    queryFn: () => getOrder(publicId),
    refetchInterval: (query) =>
      returnedFromPayment && query.state.data?.status === 'pending_payment' ? 3000 : false,
  });

  const status = order.data?.status;
  useEffect(() => {
    if (returnedFromPayment && status === 'paid') router.replace(`/orders/${publicId}/success`);
  }, [returnedFromPayment, status, publicId, router]);

  const cancel = useMutation({
    mutationFn: () => cancelOrder(publicId, reason.trim() || undefined),
    onSuccess: () => {
      setConfirmOpen(false);
      notify.success(ua.order.cancelled);
      void queryClient.invalidateQueries({ queryKey: ['order', publicId] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (order.isPending)
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: '24px' }} />;
  if (order.isError) return <Alert severity="error">{errorMessage(order.error)}</Alert>;
  const data = order.data;

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
        <Typography variant="h2" component="h1">
          {ua.order.number(data.publicId)}
        </Typography>
        <OrderStatusChip status={data.status} />
      </Stack>

      {returnedFromPayment && data.status === 'pending_payment' && (
        <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3 }}>
          {ua.order.checkingPayment}
        </Alert>
      )}

      <Layout>
        <Stack spacing={3}>
          <Panel>
            <OrderSummary order={data} />
            {data.pickedUpAt && (
              <Typography variant="body2" sx={{ mt: 2, color: 'success.main', fontWeight: 700 }}>
                {ua.order.pickedUpAt(formatDateTime(data.pickedUpAt))}
              </Typography>
            )}
            {data.cancelReason && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {data.cancelReason}
              </Alert>
            )}
          </Panel>
          <Panel>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              {ua.order.timeline}
            </Typography>
            <Timeline>
              {data.statusHistory.map((entry) => (
                <li key={`${entry.to}-${entry.at}`}>
                  {ua.orders.status[entry.to]}
                  <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                </li>
              ))}
            </Timeline>
          </Panel>
        </Stack>

        <Stack spacing={2}>
          {data.voucher && <QrVoucher voucher={data.voucher} />}
          {data.status === 'pending_payment' && (
            <Button
              component={NextLink}
              href={`/checkout/${data.publicId}`}
              variant="contained"
              size="large"
              sx={{ bgcolor: 'primary.dark' }}
            >
              {ua.order.continuePayment}
            </Button>
          )}
          <Button
            href={directionsUrl(data.venue.lat, data.venue.lng)}
            target="_blank"
            rel="noopener"
            variant="outlined"
            startIcon={<DirectionsOutlinedIcon />}
          >
            {ua.common.route}
          </Button>
          {CANCELLABLE.has(data.status) && (
            <Button color="error" onClick={() => setConfirmOpen(true)}>
              {ua.checkout.cancel}
            </Button>
          )}
        </Stack>
      </Layout>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{ua.order.cancelTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {data.status === 'paid' ? ua.order.cancelPaidText : ua.order.cancelPendingText}
          </DialogContentText>
          {cancel.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage(cancel.error)}
            </Alert>
          )}
          <TextField
            fullWidth
            label={ua.order.cancelReason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{ua.common.close}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
          >
            {ua.order.cancelConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function OrderPage() {
  return (
    <PageMain>
      <PageContainer>
        <Button component={NextLink} href="/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {ua.orders.title}
        </Button>
        <RequireAuth>
          <Suspense>
            <OrderDetails />
          </Suspense>
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
