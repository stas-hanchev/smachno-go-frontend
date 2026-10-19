'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { errorMessage } from '@/api/client';
import { getOrder } from '@/api/orders';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { OrderSummary } from '@/components/orders/OrderSummary';
import { QrVoucher } from '@/components/orders/QrVoucher';
import { ua } from '@/i18n/ua';
import { directionsUrl } from '@/lib/format';
import { shadows } from '@/theme/theme';

const Card = styled('section', { name: 'SgOrderSuccess', slot: 'Card' })(({ theme }) => ({
  display: 'grid',
  gap: 32,
  gridTemplateColumns: '1fr',
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.raised,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
    padding: 40,
    alignItems: 'center',
  },
}));

const Check = styled(CheckCircleRoundedIcon, {
  name: 'SgOrderSuccess',
  slot: 'Check',
})(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.success.main,
}));

function Success() {
  const { publicId } = useParams<{ publicId: string }>();
  const order = useQuery({
    queryKey: ['order', publicId],
    queryFn: () => getOrder(publicId),
    refetchInterval: (query) => (query.state.data?.status === 'pending_payment' ? 3000 : false),
  });

  if (order.isPending)
    return <Skeleton variant="rounded" height={480} sx={{ borderRadius: '24px' }} />;
  if (order.isError) return <Alert severity="error">{errorMessage(order.error)}</Alert>;

  const data = order.data;
  if (data.status === 'pending_payment') {
    return (
      <Stack spacing={2} sx={{ alignItems: 'center', py: 8, textAlign: 'center' }} role="status">
        <CircularProgress />
        <Typography variant="h4" component="h1">
          {ua.success.waiting}
        </Typography>
        <Typography color="text.secondary">{ua.success.waitingText}</Typography>
      </Stack>
    );
  }

  return (
    <Card>
      <Stack spacing={2}>
        <Check aria-hidden />
        <Typography variant="h2" component="h1">
          {data.status === 'paid' ? ua.success.title : ua.orders.status[data.status]}
        </Typography>
        <Typography color="text.secondary">{ua.success.subtitle}</Typography>
        <OrderSummary order={data} />
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
          {ua.success.paid}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            component={NextLink}
            href="/orders"
            variant="contained"
            startIcon={<ReceiptLongOutlinedIcon />}
            sx={{ bgcolor: 'primary.dark' }}
          >
            {ua.success.toOrders}
          </Button>
          <Button
            href={directionsUrl(data.venue.lat, data.venue.lng)}
            target="_blank"
            rel="noopener"
            variant="outlined"
            startIcon={<DirectionsOutlinedIcon />}
          >
            {ua.common.route}
          </Button>
        </Stack>
      </Stack>
      {data.voucher && (
        <Stack sx={{ alignItems: 'center', order: { xs: -1, md: 0 } }}>
          <QrVoucher voucher={data.voucher} size={220} />
        </Stack>
      )}
    </Card>
  );
}

export default function OrderSuccessPage() {
  return (
    <PageMain>
      <PageContainer sx={{ maxWidth: 1040 }}>
        <RequireAuth>
          <Success />
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
