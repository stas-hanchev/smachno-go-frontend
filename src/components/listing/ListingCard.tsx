'use client';

import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { RouterLink } from '@/components/ui/RouterLink';
import type { ListingCard as ListingCardData } from '@/api/types';
import { DiscountBadge, Dot, RatingBadge } from '@/components/ui/Badges';
import { FavoriteIconButton } from '@/components/ui/FavoriteButton';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { PriceTag } from '@/components/ui/PriceTag';
import { ua } from '@/i18n/ua';
import { dayLabel, formatDistance, formatTime } from '@/lib/format';
import { listingHref, type InteractionSource } from '@/lib/interactions';
import { shadows } from '@/theme/theme';

const Card = styled('article', { name: 'SgListingCard', slot: 'Card' })<{ $muted: boolean }>(
  ({ theme, $muted }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: theme.palette.background.paper,
    boxShadow: shadows.card,
    transition: 'box-shadow 150ms, transform 150ms',
    opacity: $muted ? 0.7 : 1,
    '&:hover': { boxShadow: shadows.raised, transform: 'translateY(-2px)' },
    '&:focus-within': { boxShadow: shadows.raised },
  }),
);

const Media = styled('div', { name: 'SgListingCard', slot: 'Media' })({
  position: 'relative',
  height: 192,
  backgroundColor: '#DEF2EE',
  flexShrink: 0,
});

const DayBadge = styled('span', { name: 'SgListingCard', slot: 'DayBadge' })(({ theme }) => ({
  padding: '4px 10px',
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontSize: 13,
  lineHeight: '20px',
  fontWeight: 700,
  '&::first-letter': { textTransform: 'uppercase' },
}));

const TopLeft = styled('div', { name: 'SgListingCard', slot: 'TopLeft' })({
  display: 'flex',
  gap: 6,
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 1,
});
const TopRight = styled('div', { name: 'SgListingCard', slot: 'TopRight' })({
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 2,
});

const PickupOverlay = styled('div', { name: 'SgListingCard', slot: 'PickupOverlay' })(
  ({ theme }) => ({
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: theme.palette.overlay,
    backdropFilter: 'blur(2px)',
    color: theme.palette.common.white,
    fontSize: 13,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    '& > span': { display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 },
    '& svg': { fontSize: 14, flexShrink: 0 },
    '& .time': { overflow: 'hidden', textOverflow: 'ellipsis' },
    '& strong': { color: theme.palette.secondary.main, flexShrink: 0 },
  }),
);

const Body = styled('div', { name: 'SgListingCard', slot: 'Body' })({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: 20,
  gap: 6,
});

const TitleRow = styled('div', { name: 'SgListingCard', slot: 'TitleRow' })({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});

const VenueName = styled(RouterLink, { name: 'SgListingCard', slot: 'VenueName' })(({ theme }) => ({
  fontSize: 20,
  lineHeight: '28px',
  fontWeight: 700,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '&::after': { content: '""', position: 'absolute', inset: 0, zIndex: 0 },
  '&:focus-visible': { outline: 'none' },
}));

const Meta = styled('div', { name: 'SgListingCard', slot: 'Meta' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingTop: 4,
  minWidth: 0,
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& > span': { display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' },
  '& > span:last-of-type': { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' },
  '& svg': { fontSize: 14 },
}));

const Footer = styled('div', { name: 'SgListingCard', slot: 'Footer' })({
  marginTop: 'auto',
  paddingTop: 12,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 12,
});

const Raised = styled('div', { name: 'SgListingCard', slot: 'Raised' })({
  position: 'relative',
  zIndex: 1,
});

export function ListingCard({
  listing,
  heading = 'venue',
  source,
  trackRef,
}: {
  listing: ListingCardData;
  heading?: 'venue' | 'offer';
  source?: InteractionSource;
  trackRef?: (element: Element | null) => void;
}) {
  const soldOut = listing.quantityLeft === 0 || listing.status !== 'on_sale';
  const distance = formatDistance(listing.distanceM);
  const href = listingHref(listing.id, source);
  const day = dayLabel(listing.pickupStart);

  return (
    <Card $muted={soldOut} ref={trackRef}>
      <Media>
        <ListingPhoto
          src={listing.offer.photoUrl}
          alt={listing.offer.title}
          categoryName={listing.offer.category.name}
        />
        <TopLeft>
          <DiscountBadge>−{listing.discountPercent}%</DiscountBadge>
          {day !== ua.common.today && <DayBadge>{day}</DayBadge>}
        </TopLeft>
        <TopRight>
          <FavoriteIconButton venueId={listing.venue.id} isFavorite={listing.isFavoriteVenue} />
        </TopRight>
        <PickupOverlay>
          <span>
            <ScheduleIcon aria-hidden />
            <span className="time">
              {formatTime(listing.pickupStart)}–{formatTime(listing.pickupEnd)}
            </span>
          </span>
          <strong>
            {soldOut ? ua.listingCard.soldOut : ua.listingCard.left(listing.quantityLeft)}
          </strong>
        </PickupOverlay>
      </Media>
      <Body>
        <TitleRow>
          <VenueName href={href}>
            {heading === 'venue' ? listing.venue.name : listing.offer.title}
          </VenueName>
          {heading === 'venue' && <RatingBadge rating={listing.venue.ratingAvg} />}
        </TitleRow>
        <Typography variant="body2" color="text.secondary">
          {heading === 'venue' ? listing.offer.title : listing.offer.category.name}
        </Typography>
        <Meta>
          {distance && (
            <>
              <span>
                <NearMeOutlinedIcon aria-hidden />
                {distance}
              </span>
              <Dot aria-hidden />
            </>
          )}
          <span>{listing.venue.address}</span>
        </Meta>
        <Footer>
          <PriceTag price={listing.price} originalPrice={listing.originalPrice} />
          <Raised>
            <Button
              component={Link}
              href={href}
              variant="contained"
              disabled={soldOut}
              tabIndex={-1}
            >
              {ua.listingCard.book}
            </Button>
          </Raised>
        </Footer>
      </Body>
    </Card>
  );
}
