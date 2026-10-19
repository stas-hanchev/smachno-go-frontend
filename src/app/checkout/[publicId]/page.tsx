'use client';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { cancelOrder, confirmFakePayment, getOrder, retryPayment } from '@/api/orders';
import type { CheckoutParams } from '@/api/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { OrderSummary } from '@/components/orders/OrderSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { checkoutPaymentKey } from '@/hooks/useBookListing';
import { useCountdown } from '@/hooks/useCountdown';
import { ua } from '@/i18n/ua';
import { formatCountdown, formatPrice } from '@/lib/format';
import { submitCheckout } from '@/lib/liqpay';
import { shadows } from '@/theme/theme';

const Layout = styled('div', { name: 'SgCheckout', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: 32 },
}));

const Panel = styled('section', { name: 'SgCheckout', slot: 'Panel' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { padding: 32 },
}));

const Timer = styled('div', { name: 'SgCheckout', slot: 'Timer' })<{ $urgent: boolean }>(
  ({ theme, $urgent }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: $urgent ? '#FDECEA' : theme.palette.secondary.main,
    color: $urgent ? theme.palette.error.main : theme.palette.secondary.contrastText,
    '& strong': { fontSize: 24, lineHeight: '32px', fontVariantNumeric: 'tabular-nums' },
  }),
);

const URGENT_MS = 2 * 60_000;

function Checkout() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [payError, setPayError] = useState<string | null>(null);

  const order = useQuery({ queryKey: ['order', publicId], queryFn: () => getOrder(publicId) });
  const { remainingMs, expired } = useCountdown(order.data?.reservedUntil);
  const status = order.data?.status;

  useEffect(() => {
    if (status === 'paid') router.replace(`/orders/${publicId}/success`);
  }, [status, publicId, router]);

  useEffect(() => {
    if (expired && status === 'pending_payment') {
      void queryClient.invalidateQueries({ queryKey: ['order', publicId] });
    }
  }, [expired, status, publicId, queryClient]);

  async function paymentParams(): Promise<CheckoutParams> {
    const cached = queryClient.getQueryData<CheckoutParams | null>(checkoutPaymentKey(publicId));
    if (cached) return cached;
    const fresh = await retryPayment(publicId);
    queryClient.setQueryData(checkoutPaymentKey(publicId), fresh);
    return fresh;
  }

  const pay = useMutation({
    mutationFn: async (testResult?: 'success' | 'failure') => {
      setPayError(null);
      const payment = await paymentParams();
      if (payment.provider === 'fake') {
        if (!testResult) return { redirected: false, outcome: 'choose', testResult };
        const result = await confirmFakePayment(payment.checkoutUrl, testResult ?? 'success');
        queryClient.removeQueries({ queryKey: checkoutPaymentKey(publicId) });
        return { redirected: false, outcome: result.outcome, testResult };
      }
      submitCheckout(payment);
      return { redirected: true, outcome: 'redirect', testResult };
    },
    onSuccess: async ({ redirected, testResult }) => {
      if (redirected) return;
      await queryClient.invalidateQueries({ queryKey: ['order', publicId] });
      if (testResult === 'failure') setPayError(ua.checkout.paymentFailed);
    },
    onError: (error) => setPayError(errorMessage(error)),
  });

  const cancel = useMutation({
    mutationFn: () => cancelOrder(publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/orders');
    },
    onError: (error) => setPayError(errorMessage(error)),
  });

  const provider = queryClient.getQueryData<CheckoutParams | null>(
    checkoutPaymentKey(publicId),
  )?.provider;

  if (order.isPending) {
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: '24px' }} />;
  }
  if (order.isError) return <Alert severity="error">{errorMessage(order.error)}</Alert>;

  const data = order.data;
  if (data.status !== 'pending_payment' || expired) {
    if (data.status === 'paid') return null;
    return (
      <EmptyState
        icon={<TimerOffOutlinedIcon />}
        title={ua.checkout.expiredTitle}
        text={ua.checkout.expiredText}
        action={
          <Stack direction="row" spacing={1}>
            <Button component={NextLink} href={`/listings/${data.listingId}`} variant="contained">
              {ua.checkout.findOther}
            </Button>
            <Button component={NextLink} href={`/orders/${publicId}`}>
              {ua.orders.details}
            </Button>
          </Stack>
        }
      />
    );
  }

  return (
    <Layout>
      <Panel>
        <Timer $urgent={remainingMs < URGENT_MS} role="timer" aria-live="off">
          <TimerOutlinedIcon aria-hidden />
          <span style={{ flex: 1 }}>{ua.checkout.timer}</span>
          <strong>{formatCountdown(remainingMs)}</strong>
        </Timer>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          {ua.checkout.summary}
        </Typography>
        <OrderSummary order={data} />
      </Panel>

      <Panel>
        <Stack spacing={2}>
          {payError && <Alert severity="error">{payError}</Alert>}
          {provider === 'fake' ? (
            <>
              <Alert severity="warning" icon={<ScienceOutlinedIcon />}>
                <strong>{ua.checkout.testTitle}.</strong> {ua.checkout.testText}
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={() => pay.mutate('success')}
                disabled={pay.isPending}
                sx={{ bgcolor: 'primary.dark' }}
              >
                {ua.checkout.testSuccess}
              </Button>
              <Button
                variant="outlined"
                onClick={() => pay.mutate('failure')}
                disabled={pay.isPending}
              >
                {ua.checkout.testFailure}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<LockOutlinedIcon />}
                onClick={() => pay.mutate(undefined)}
                disabled={pay.isPending}
                sx={{ bgcolor: 'primary.dark' }}
              >
                {pay.isPending
                  ? ua.checkout.redirecting
                  : ua.checkout.pay(formatPrice(data.totalAmount))}
              </Button>
              <Typography variant="caption" sx={{ color: 'muted', textAlign: 'center' }}>
                {ua.checkout.payNote}
              </Typography>
            </>
          )}
          <Button
            color="error"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending || pay.isPending}
          >
            {ua.checkout.cancel}
          </Button>
        </Stack>
      </Panel>
    </Layout>
  );
}

export default function CheckoutPage() {
  return (
    <PageMain>
      <PageContainer>
        <Typography variant="h2" component="h1" sx={{ mb: 3 }}>
          {ua.checkout.title}
        </Typography>
        <RequireAuth>
          <Checkout />
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
