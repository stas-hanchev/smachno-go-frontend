'use client';

import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useState } from 'react';
import { getCategories } from '@/api/catalog';
import { errorMessage } from '@/api/client';
import { listOrders, type OrderScope } from '@/api/orders';
import type { Order } from '@/api/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { OrderCard } from '@/components/orders/OrderCard';
import { VoucherDialog } from '@/components/orders/VoucherDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ua } from '@/i18n/ua';
import { shadows } from '@/theme/theme';

const Layout = styled('div', { name: 'SgOrders', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 32 },
}));

const HowCard = styled('aside', { name: 'SgOrders', slot: 'HowCard' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  '& svg': { color: theme.palette.success.main, fontSize: 32 },
}));

function OrdersList() {
  const [scope, setScope] = useState<OrderScope>('active');
  const [qrOrder, setQrOrder] = useState<Order | null>(null);
  const orders = useQuery({ queryKey: ['orders', scope], queryFn: () => listOrders(scope) });
  const categories = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => getCategories(),
    staleTime: Infinity,
    enabled: orders.data?.length === 0,
  });

  return (
    <>
      <Tabs
        value={scope}
        onChange={(_e, value: OrderScope) => setScope(value)}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="active" label={ua.orders.active} />
        <Tab value="history" label={ua.orders.history} />
      </Tabs>
      <Layout>
        <div>
          {orders.isError && <Alert severity="error">{errorMessage(orders.error)}</Alert>}
          {orders.isPending ? (
            <Stack spacing={2}>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} variant="rounded" height={136} sx={{ borderRadius: '24px' }} />
              ))}
            </Stack>
          ) : orders.data && orders.data.length > 0 ? (
            <Stack spacing={2}>
              {orders.data.map((order) => (
                <OrderCard key={order.publicId} order={order} onShowQr={setQrOrder} />
              ))}
            </Stack>
          ) : (
            <Stack spacing={4}>
              <EmptyState
                icon={<ShoppingBagOutlinedIcon />}
                title={scope === 'active' ? ua.orders.emptyTitle : ua.orders.emptyHistory}
                text={ua.orders.emptyText}
                action={
                  <Button component={NextLink} href="/search" variant="contained" size="large">
                    {ua.orders.find}
                  </Button>
                }
              />
              {categories.data && (
                <div>
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                    {ua.orders.ideas}
                  </Typography>
                  <CategoryTiles categories={categories.data} loading={false} />
                </div>
              )}
            </Stack>
          )}
        </div>
        <HowCard>
          <QrCodeScannerOutlinedIcon aria-hidden />
          <Typography variant="h5" component="h2">
            {ua.orders.howTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ua.orders.howText}
          </Typography>
        </HowCard>
      </Layout>
      <VoucherDialog order={qrOrder} onClose={() => setQrOrder(null)} />
    </>
  );
}

export default function OrdersPage() {
  return (
    <PageMain>
      <PageContainer>
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
          {ua.orders.title}
        </Typography>
        <RequireAuth>
          <OrdersList />
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
