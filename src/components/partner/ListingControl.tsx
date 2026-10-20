'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { cancelListing, closeListing, updateListing } from '@/api/partner';
import type { ListingStatus, PartnerListing } from '@/api/types';
import { ReasonDialog } from '@/components/ui/ReasonDialog';
import { ua } from '@/i18n/ua';
import { formatPrice, formatTimeRange } from '@/lib/format';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';

const t = ua.partner.today;

const TONES: Record<ListingStatus, { bg: string; fg: string }> = {
  scheduled: { bg: '#E3F8F3', fg: '#006B54' },
  on_sale: { bg: '#94F5D4', fg: '#002118' },
  sold_out: { bg: '#FFF4D6', fg: '#7A5200' },
  closed: { bg: '#ECEFEE', fg: '#3F4947' },
  cancelled: { bg: '#FDECEA', fg: '#C62828' },
};

const Card = styled('article', { name: 'SgListingControl', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 16,
  padding: 18,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Chip = styled('span', { name: 'SgListingControl', slot: 'Chip' })<{
  $bg: string;
  $fg: string;
}>(({ $bg, $fg }) => ({
  padding: '2px 10px',
  borderRadius: 9999,
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 700,
  backgroundColor: $bg,
  color: $fg,
}));

const Stepper = styled('div', { name: 'SgListingControl', slot: 'Stepper' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  borderRadius: 9999,
  backgroundColor: theme.palette.mint.light,
  '& output': { minWidth: 36, textAlign: 'center', fontWeight: 800 },
}));

export function ListingControl({
  venueId,
  listing,
  isOwner,
}: {
  venueId: number;
  listing: PartnerListing;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'listings'] });
  const onError = (error: unknown) => notify.error(errorMessage(error));

  const quantity = useMutation({
    mutationFn: (quantityTotal: number) => updateListing(venueId, listing.id, { quantityTotal }),
    onSuccess: () => void refresh(),
    onError,
  });
  const close = useMutation({
    mutationFn: () => closeListing(venueId, listing.id),
    onSuccess: () => {
      notify.success(t.closed);
      void refresh();
    },
    onError,
  });
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelListing(venueId, listing.id, reason),
    onSuccess: () => {
      notify.success(t.cancelled);
      setCancelOpen(false);
      void refresh();
      void queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'orders'] });
    },
  });

  const editable =
    listing.status === 'on_sale' || listing.status === 'sold_out' || listing.status === 'scheduled';
  const progress = listing.quantityTotal ? (listing.quantitySold / listing.quantityTotal) * 100 : 0;
  const tone = TONES[listing.status];

  return (
    <Card>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Typography variant="h6" component="h3">
            {listing.offerTitle}
          </Typography>
          <Chip $bg={tone.bg} $fg={tone.fg}>
            {t.listingStatus[listing.status]}
          </Chip>
        </div>
        <Typography variant="body2" color="text.secondary">
          {formatTimeRange(listing.pickupStart, listing.pickupEnd)} · {formatPrice(listing.price)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
          {t.soldOf(listing.quantitySold, listing.quantityTotal)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ height: 8, borderRadius: 9999, bgcolor: 'mint.light', mt: 0.5 }}
        />
        {listing.cancelReason && (
          <Typography variant="caption" color="error">
            {listing.cancelReason}
          </Typography>
        )}
      </div>
      {editable && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Stepper>
            <IconButton
              size="small"
              aria-label={t.decrease}
              disabled={quantity.isPending || listing.quantityTotal <= listing.quantitySold}
              onClick={() => quantity.mutate(listing.quantityTotal - 1)}
              sx={{ bgcolor: 'background.paper' }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <output aria-live="polite">{listing.quantityTotal}</output>
            <IconButton
              size="small"
              aria-label={t.increase}
              disabled={quantity.isPending}
              onClick={() => quantity.mutate(listing.quantityTotal + 1)}
              sx={{ bgcolor: 'background.paper' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stepper>
          {listing.status !== 'scheduled' && (
            <Button
              size="small"
              variant="outlined"
              disabled={close.isPending}
              onClick={() => close.mutate()}
            >
              {t.closeSales}
            </Button>
          )}
          {isOwner && (
            <Button size="small" color="error" onClick={() => setCancelOpen(true)}>
              {t.cancel}
            </Button>
          )}
        </div>
      )}
      <ReasonDialog
        open={cancelOpen}
        title={t.cancelTitle}
        text={t.cancelText}
        confirmLabel={t.confirmCancel}
        pending={cancel.isPending}
        error={cancel.error ? errorMessage(cancel.error) : null}
        onConfirm={(reason) => cancel.mutate(reason)}
        onClose={() => setCancelOpen(false)}
      />
    </Card>
  );
}
