'use client';

import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import type { ListingCard as ListingCardData } from '@/api/types';
import { useListingSubscription } from '@/components/providers/RealtimeProvider';
import { useImpressions } from '@/hooks/useImpressions';
import type { InteractionSource } from '@/lib/interactions';
import { ListingCard } from './ListingCard';
import { ListingRow } from './ListingRow';

export const CardGrid = styled('div', { name: 'SgListingGrid', slot: 'CardGrid' })<{
  $columns?: number;
}>(({ theme, $columns = 4 }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: `repeat(${Math.min($columns, 3)}, minmax(0, 1fr))`,
  },
  [theme.breakpoints.up('lg')]: { gridTemplateColumns: `repeat(${$columns}, minmax(0, 1fr))` },
}));

const RowsOnMobile = styled('div', { name: 'SgListingGrid', slot: 'RowsOnMobile' })(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    [theme.breakpoints.up('sm')]: { display: 'none' },
  }),
);

const GridFromTablet = styled(CardGrid, { name: 'SgListingGrid', slot: 'GridFromTablet' })(
  ({ theme }) => ({
    display: 'none',
    [theme.breakpoints.up('sm')]: { display: 'grid' },
  }),
);

export function ListingGrid({
  listings,
  columns = 4,
  compactOnMobile = false,
  heading = 'venue',
  source,
}: {
  listings: ListingCardData[];
  columns?: number;
  compactOnMobile?: boolean;
  heading?: 'venue' | 'offer';
  source?: InteractionSource;
}) {
  useListingSubscription(listings.map((l) => l.id));
  const track = useImpressions(source ?? 'direct');
  const trackRef = (listing: ListingCardData, index: number) =>
    source ? track(listing.offer.id, index) : undefined;

  if (!compactOnMobile) {
    return (
      <CardGrid $columns={columns}>
        {listings.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            heading={heading}
            source={source}
            trackRef={trackRef(listing, index)}
          />
        ))}
      </CardGrid>
    );
  }
  return (
    <>
      <RowsOnMobile>
        {listings.map((listing, index) => (
          <ListingRow
            key={listing.id}
            listing={listing}
            source={source}
            trackRef={trackRef(listing, index)}
          />
        ))}
      </RowsOnMobile>
      <GridFromTablet $columns={columns}>
        {listings.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            heading={heading}
            source={source}
            trackRef={trackRef(listing, index)}
          />
        ))}
      </GridFromTablet>
    </>
  );
}

export function ListingGridSkeleton({
  count = 4,
  columns = 4,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <CardGrid $columns={columns} aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={380} sx={{ borderRadius: '20px' }} />
      ))}
    </CardGrid>
  );
}
