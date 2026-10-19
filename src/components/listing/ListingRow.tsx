'use client';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import type { ListingCard } from '@/api/types';
import { DiscountBadge, Dot } from '@/components/ui/Badges';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { ua } from '@/i18n/ua';
import { formatDistance, formatPickupWindow, formatPrice } from '@/lib/format';
import { shadows } from '@/theme/theme';

const Row = styled(RouterLink, { name: 'SgListingRow', slot: 'Row' })(({ theme }) => ({
  display: 'flex',
  gap: 16,
  padding: 16,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  textDecoration: 'none',
  color: 'inherit',
}));

const Thumb = styled('div', { name: 'SgListingRow', slot: 'Thumb' })({
  position: 'relative',
  width: 96,
  height: 96,
  borderRadius: 12,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: '#DEF2EE',
  '& .badge': { position: 'absolute', left: 6, top: 6, zIndex: 1, padding: '0 6px', fontSize: 12 },
});

const Info = styled('div', { name: 'SgListingRow', slot: 'Info' })({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
  gap: 2,
});

const Meta = styled('div', { name: 'SgListingRow', slot: 'Meta' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 'auto',
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& .rating': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    color: theme.palette.success.main,
    fontWeight: 700,
  },
  '& svg': { fontSize: 16 },
}));

export function ListingRow({ listing }: { listing: ListingCard }) {
  const distance = formatDistance(listing.distanceM);
  return (
    <Row href={`/listings/${listing.id}`}>
      <Thumb>
        <ListingPhoto
          src={listing.offer.photoUrl}
          alt={listing.offer.title}
          categoryName={listing.offer.category.name}
        />
        <DiscountBadge className="badge">−{listing.discountPercent}%</DiscountBadge>
      </Thumb>
      <Info>
        <Typography variant="h6" component="h3" noWrap>
          {listing.venue.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {listing.offer.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {formatPickupWindow(listing.pickupStart, listing.pickupEnd)} ·{' '}
          <strong>{formatPrice(listing.price)}</strong>
        </Typography>
        <Meta>
          {listing.venue.ratingAvg ? (
            <span className="rating">
              <StarRoundedIcon aria-hidden />
              {Number(listing.venue.ratingAvg).toFixed(1)}
            </span>
          ) : (
            <span>{ua.listingCard.newVenue}</span>
          )}
          {distance && (
            <>
              <Dot aria-hidden />
              <span>{distance}</span>
            </>
          )}
          <Dot aria-hidden />
          <span>{ua.listingCard.left(listing.quantityLeft)}</span>
        </Meta>
      </Info>
    </Row>
  );
}
