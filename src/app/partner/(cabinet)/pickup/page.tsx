'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/client';
import { pickupOrder, verifyPickup } from '@/api/partner';
import type { VenueOrder } from '@/api/types';
import { OrderStatusChip } from '@/components/orders/OrderStatusChip';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import { QrScanner } from '@/components/partner/QrScanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatPrice, formatTimeRange } from '@/lib/format';
import { shadows } from '@/theme/theme';

const t = ua.partner.pickup;
const CODE = /^[A-Za-z0-9]{6}$/;

const Panel = styled('section', { name: 'SgPartnerPickup', slot: 'Panel' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Row = styled('div', { name: 'SgPartnerPickup', slot: 'Row' })(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 0',
  borderBottom: `1px solid ${theme.palette.mint.light}`,
  fontSize: 16,
  '& span:first-of-type': { color: theme.palette.text.secondary },
  '& span:last-of-type': { fontWeight: 700, textAlign: 'right' },
}));

function OrderCard({ order }: { order: VenueOrder }) {
  return (
    <div>
      <Row>
        <span>{t.customer}</span>
        <span>{order.customerName}</span>
      </Row>
      <Row>
        <span>{t.set}</span>
        <span>{order.offerTitle}</span>
      </Row>
      <Row>
        <span>{t.quantity}</span>
        <span>{order.quantity}</span>
      </Row>
      <Row>
        <span>{t.window}</span>
        <span>{formatTimeRange(order.pickupStart, order.pickupEnd)}</span>
      </Row>
      <Row>
        <span>{t.total}</span>
        <span>{formatPrice(order.totalAmount)}</span>
      </Row>
    </div>
  );
}

export default function PartnerPickupPage() {
  const { venue } = usePartnerVenue();
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [given, setGiven] = useState<VenueOrder | null>(null);

  const verify = useMutation({
    mutationFn: (input: { code: string } | { qrToken: string }) => verifyPickup(venue.id, input),
  });
  const give = useMutation({
    mutationFn: (publicId: string) => pickupOrder(venue.id, publicId),
    onSuccess: (order) => {
      setGiven(order);
      verify.reset();
      void queryClient.invalidateQueries({ queryKey: ['partner', venue.id] });
    },
  });

  const onScan = useCallback(
    (text: string) => {
      setScanning(false);
      verify.mutate({ qrToken: text });
    },
    [verify],
  );
  const onCameraError = useCallback(() => {
    setScanning(false);
    setCameraError(true);
  }, []);

  function submitCode(event: FormEvent) {
    event.preventDefault();
    if (!CODE.test(code.trim())) return;
    setGiven(null);
    verify.mutate({ code: code.trim().toUpperCase() });
  }

  function reset() {
    setGiven(null);
    setCode('');
    verify.reset();
    give.reset();
  }

  const order = verify.data;
  const codeInvalid = code.length > 0 && !CODE.test(code.trim());

  return (
    <>
      <SectionHeading level="h1" size="medium" title={t.title} subtitle={t.hint} />
      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        {given ? (
          <Panel>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 64, color: 'success.main' }} />
              <Typography variant="h4" component="p">
                {t.given}
              </Typography>
              <Typography color="text.secondary">
                {given.customerName} · {given.offerTitle} × {given.quantity}
              </Typography>
              <Button variant="contained" size="large" onClick={reset}>
                {t.next}
              </Button>
            </Stack>
          </Panel>
        ) : order ? (
          <Panel>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h4" component="h2" sx={{ flex: 1 }}>
                  {t.found}
                </Typography>
                <OrderStatusChip status={order.status} />
              </Stack>
              <OrderCard order={order} />
              {give.isError && <Alert severity="error">{errorMessage(give.error)}</Alert>}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ flex: 1, bgcolor: 'primary.dark' }}
                  disabled={give.isPending}
                  onClick={() => give.mutate(order.publicId)}
                >
                  {t.give}
                </Button>
                <Button size="large" onClick={reset}>
                  {ua.common.cancel}
                </Button>
              </Stack>
            </Stack>
          </Panel>
        ) : (
          <>
            <Panel>
              {scanning ? (
                <Stack spacing={2}>
                  <QrScanner onResult={onScan} onError={onCameraError} />
                  <Button onClick={() => setScanning(false)}>{t.stopScan}</Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<QrCodeScannerIcon />}
                  sx={{ py: 3, fontSize: 18 }}
                  onClick={() => {
                    setCameraError(false);
                    verify.reset();
                    setScanning(true);
                  }}
                >
                  {t.scan}
                </Button>
              )}
              {cameraError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {t.cameraError}
                </Alert>
              )}
            </Panel>
            <Panel>
              <form onSubmit={submitCode} noValidate>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label={t.codeLabel}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    error={codeInvalid}
                    helperText={codeInvalid ? t.codeInvalid : undefined}
                    autoComplete="off"
                    slotProps={{
                      htmlInput: {
                        inputMode: 'text',
                        maxLength: 6,
                        style: { letterSpacing: 6, fontWeight: 800, fontSize: 22 },
                      },
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={verify.isPending || !CODE.test(code.trim())}
                  >
                    {t.check}
                  </Button>
                </Stack>
              </form>
            </Panel>
          </>
        )}
        {verify.isError && <Alert severity="error">{errorMessage(verify.error)}</Alert>}
      </Stack>
    </>
  );
}
