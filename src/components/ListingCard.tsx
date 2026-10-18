import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import type { ListingCard as ListingCardData } from '@/api/types';
import { formatDistance, formatPickupWindow, formatPrice } from '@/lib/format';

const PhotoPlaceholder = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #e8f5e9, #fff3e0);
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  opacity: 0.6;
`;

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const distance = formatDistance(listing.distanceM);
  const soldOut = listing.quantityLeft === 0;

  return (
    <Card variant="outlined" sx={{ height: '100%', opacity: soldOut ? 0.6 : 1 }}>
      {listing.offer.photoUrl ? (
        <CardMedia
          component="img"
          height={160}
          image={listing.offer.photoUrl}
          alt={listing.offer.title}
        />
      ) : (
        <PhotoPlaceholder aria-hidden>🥐</PhotoPlaceholder>
      )}
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" color="secondary" label={`−${listing.discountPercent}%`} />
          <Chip
            size="small"
            variant="outlined"
            label={soldOut ? 'Розібрали' : `Залишилось ${listing.quantityLeft}`}
          />
        </Stack>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
          {listing.offer.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {listing.venue.name}
          {distance && ` · ${distance}`}
          {listing.venue.ratingAvg && ` · ★ ${listing.venue.ratingAvg}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Забрати {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
        </Typography>
        <Typography variant="h6" component="p" sx={{ mt: 1 }}>
          {formatPrice(listing.price)}{' '}
          <Typography component="span" variant="body2">
            <OldPrice>{formatPrice(listing.originalPrice)}</OldPrice>
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
