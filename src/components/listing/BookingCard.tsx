'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { resendVerifyEmail } from '@/api/auth';
import type { ListingDetails } from '@/api/types';
import { FavoriteTextButton } from '@/components/ui/FavoriteButton';
import { PriceTag } from '@/components/ui/PriceTag';
import { ShareTextButton } from '@/components/ui/ShareButton';
import { useBookListing } from '@/hooks/useBookListing';
import { ua } from '@/i18n/ua';
import { formatPickupWindow, formatPrice } from '@/lib/format';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';
import { QuantityStepper } from './QuantityStepper';

const Card = styled('aside', { name: 'SgBookingCard', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.raised,
  [theme.breakpoints.up('md')]: { position: 'sticky', top: 104 },
}));

const Saving = styled('span', { name: 'SgBookingCard', slot: 'Saving' })(({ theme }) => ({
  alignSelf: 'flex-start',
  padding: '4px 10px',
  borderRadius: 9999,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
}));

const Block = styled('div', { name: 'SgBookingCard', slot: 'Block' })(({ theme }) => ({
  display: 'flex',
  gap: 12,
  padding: 14,
  borderRadius: 16,
  backgroundColor: theme.palette.mint.light,
  '& > svg': { color: theme.palette.success.main, flexShrink: 0, marginTop: 2 },
}));

export function BookingCard({ listing }: { listing: ListingDetails }) {
  const user = useSessionStore((s) => s.user);
  const [quantity, setQuantity] = useState(1);
  const { book, pending, error } = useBookListing(listing.id);
  const resend = useMutation({
    mutationFn: resendVerifyEmail,
    onSuccess: () => notify.success(ua.auth.resent),
  });

  const salesClosed = listing.status !== 'on_sale' || new Date(listing.salesCloseAt) <= new Date();
  const soldOut = listing.quantityLeft === 0;
  const maxQuantity = Math.max(1, Math.min(listing.maxPerOrder, listing.quantityLeft));
  const safeQuantity = Math.min(quantity, maxQuantity);
  const total = (Number(listing.price) * safeQuantity).toFixed(2);
  const soldShare =
    listing.quantityTotal > 0
      ? ((listing.quantityTotal - listing.quantityLeft) / listing.quantityTotal) * 100
      : 100;
  const needsVerification = user !== null && !user.emailVerified;

  return (
    <Card aria-label={ua.listing.book(formatPrice(listing.price))}>
      <div>
        <PriceTag price={listing.price} originalPrice={listing.originalPrice} size="large" inline />
        <Saving>{ua.listing.save(formatPrice(listing.savingAmount))}</Saving>
      </div>

      <div>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {ua.listing.reserveStatus}
          </Typography>
          <Typography variant="subtitle2" aria-live="polite">
            {soldOut
              ? ua.listing.soldOut
              : ua.listing.left(listing.quantityLeft, listing.quantityTotal)}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={soldShare}
          color="success"
          sx={{ height: 8, borderRadius: 9999, bgcolor: 'mint.light' }}
        />
      </div>

      <Block>
        <AccessTimeIcon aria-hidden />
        <div>
          <Typography variant="body2" color="text.secondary">
            {ua.listing.pickupTitle}
          </Typography>
          <Typography variant="subtitle1">
            {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
          </Typography>
        </div>
      </Block>

      <Block>
        <SpaOutlinedIcon aria-hidden />
        <div>
          <Typography variant="body2" color="text.secondary">
            {ua.listing.ecoTitle}
          </Typography>
          <Typography variant="body2">
            {ua.listing.ecoText(listing.ecoImpact.weightKg, listing.ecoImpact.co2Kg)}
          </Typography>
        </div>
      </Block>

      {!soldOut && !salesClosed && (
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="subtitle2">{ua.listing.quantity}</Typography>
            <Typography variant="caption" sx={{ color: 'muted' }}>
              {ua.listing.maxPerOrder(listing.maxPerOrder)}
            </Typography>
          </div>
          <QuantityStepper
            label={ua.listing.quantity}
            value={safeQuantity}
            max={maxQuantity}
            onChange={setQuantity}
          />
        </Stack>
      )}

      {error && <Alert severity="error">{error.message}</Alert>}
      {needsVerification && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
            >
              {ua.auth.resend}
            </Button>
          }
        >
          {ua.listing.verifyEmail}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={<ShoppingBagOutlinedIcon />}
        disabled={soldOut || salesClosed || pending || needsVerification}
        onClick={() => book(safeQuantity)}
        sx={{ bgcolor: 'primary.dark' }}
      >
        {soldOut
          ? ua.listing.soldOut
          : salesClosed
            ? ua.listing.salesClosed
            : user
              ? ua.listing.book(formatPrice(total))
              : ua.listing.loginToBook}
      </Button>
      {!soldOut && !salesClosed && (
        <Typography variant="caption" sx={{ color: 'muted', textAlign: 'center' }}>
          {ua.listing.reserveNote}
        </Typography>
      )}

      <Stack direction="row" spacing={1}>
        <FavoriteTextButton venueId={listing.venue.id} isFavorite={listing.venue.isFavorite} />
        <ShareTextButton title={listing.offer.title} />
      </Stack>
    </Card>
  );
}
