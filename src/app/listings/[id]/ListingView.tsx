'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { getListing, getNearbyListings } from '@/api/catalog';
import type { ListingDetails } from '@/api/types';
import { TAB_BAR_HEIGHT } from '@/components/layout/MobileTabBar';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { BookingCard } from '@/components/listing/BookingCard';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { VenueLocationMap } from '@/components/maps/LazyMaps';
import { useListingSubscription } from '@/components/providers/RealtimeProvider';
import { DiscountBadge, PillBadge } from '@/components/ui/Badges';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { PriceTag } from '@/components/ui/PriceTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { mapsEnabled } from '@/lib/env';
import { withDistanceFrom } from '@/lib/geo';
import { directionsUrl, formatDistance, formatPickupWindow } from '@/lib/format';
import { shadows } from '@/theme/theme';

const Layout = styled('div', { name: 'SgListingView', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32 },
}));

const Column = styled('div', { name: 'SgListingView', slot: 'Column' })({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  minWidth: 0,
});

const Panel = styled('section', { name: 'SgListingView', slot: 'Panel' })(({ theme }) => ({
  padding: 20,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { padding: 28 },
}));

const Photo = styled('div', { name: 'SgListingView', slot: 'Photo' })(({ theme }) => ({
  position: 'relative',
  height: 260,
  borderRadius: 24,
  overflow: 'hidden',
  backgroundColor: '#DEF2EE',
  boxShadow: shadows.raised,
  [theme.breakpoints.up('md')]: { height: 380 },
}));

const PhotoTop = styled('div', { name: 'SgListingView', slot: 'PhotoTop' })({
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  zIndex: 1,
  display: 'flex',
  justifyContent: 'space-between',
});

const PhotoBottom = styled('div', { name: 'SgListingView', slot: 'PhotoBottom' })(({ theme }) => ({
  position: 'absolute',
  left: 16,
  bottom: 16,
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 12,
  backgroundColor: theme.palette.overlay,
  color: theme.palette.common.white,
  fontSize: 14,
  lineHeight: '20px',
  '& svg': { fontSize: 16 },
}));

const Tags = styled('div', { name: 'SgListingView', slot: 'Tags' })({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 16,
});

const Tag = styled('span', { name: 'SgListingView', slot: 'Tag' })(({ theme }) => ({
  padding: '4px 12px',
  borderRadius: 9999,
  border: `1px solid ${theme.palette.secondary.main}`,
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.primary.dark,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
}));

const Steps = styled('ol', { name: 'SgListingView', slot: 'Steps' })(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: 12,
  gridTemplateColumns: '1fr',
  counterReset: 'step',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  '& li': {
    counterIncrement: 'step',
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.palette.mint.light,
  },
  '& li::before': {
    content: 'counter(step)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.dark,
    fontWeight: 800,
  },
}));

const VenueHeader = styled('div', { name: 'SgListingView', slot: 'VenueHeader' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 16,
});

const VenueIcon = styled('span', { name: 'SgListingView', slot: 'VenueIcon' })(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  flexShrink: 0,
}));

const MapBox = styled('div', { name: 'SgListingView', slot: 'MapBox' })({
  height: 220,
  borderRadius: 16,
  overflow: 'hidden',
});

const MobileBar = styled('div', { name: 'SgListingView', slot: 'MobileBar' })(({ theme }) => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: TAB_BAR_HEIGHT,
  zIndex: theme.zIndex.appBar - 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 16px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.08)',
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

const PhoneCard = styled('a', { name: 'SgListingView', slot: 'PhoneCard' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginTop: 16,
  padding: 16,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  textDecoration: 'none',
  color: 'inherit',
  '& > svg:first-of-type': { color: theme.palette.success.main },
}));

export function ListingView({
  id,
  initialListing,
}: {
  id: number;
  initialListing: ListingDetails;
}) {
  const { point, ready } = useSearchArea();
  const listing =
    useQuery({
      queryKey: ['listing', id, point],
      queryFn: () => getListing(id, point),
      placeholderData: initialListing,
      enabled: ready,
      staleTime: 10_000,
    }).data ?? initialListing;
  const nearby = useQuery({ queryKey: ['nearby', id], queryFn: () => getNearbyListings(id) });

  useListingSubscription([id]);

  const distance = formatDistance(listing.distanceM);

  return (
    <>
      <PageMain>
        <PageContainer>
          <Breadcrumbs aria-label={ua.venue.breadcrumbs} sx={{ mb: 2, fontSize: 14 }}>
            <MuiLink component={NextLink} href="/" color="inherit">
              {ua.nav.home}
            </MuiLink>
            <MuiLink component={NextLink} href={`/venues/${listing.venue.slug}`} color="inherit">
              {listing.venue.name}
            </MuiLink>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {listing.offer.title}
            </Typography>
          </Breadcrumbs>

          <Layout>
            <Column>
              <Photo>
                <ListingPhoto
                  src={listing.offer.photoUrl}
                  alt={listing.offer.title}
                  categoryName={listing.offer.category.name}
                />
                <PhotoTop>
                  <PillBadge>
                    <SpaOutlinedIcon aria-hidden />
                    {ua.listing.eco}
                  </PillBadge>
                  <DiscountBadge>−{listing.discountPercent}%</DiscountBadge>
                </PhotoTop>
                <PhotoBottom>
                  <AccessTimeIcon aria-hidden />
                  {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
                </PhotoBottom>
              </Photo>

              <Panel>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <StarRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} aria-hidden />
                    {listing.venue.ratingAvg
                      ? `${Number(listing.venue.ratingAvg).toFixed(1)} (${ua.venue.reviews(listing.venue.ratingCount)})`
                      : ua.venue.newVenue}
                  </Typography>
                  <MuiLink
                    component={NextLink}
                    href={`/venues/${listing.venue.slug}`}
                    variant="body2"
                    color="text.secondary"
                  >
                    {listing.venue.name}
                  </MuiLink>
                  {distance && (
                    <Typography variant="body2" color="text.secondary">
                      {ua.venue.fromYou(distance)}
                    </Typography>
                  )}
                </div>
                <Typography variant="h2" component="h1">
                  {listing.offer.title}
                </Typography>
                {listing.offer.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
                    {listing.offer.description}
                  </Typography>
                )}
                <Tags>
                  <Tag>{listing.offer.category.name}</Tag>
                  {listing.offer.tags.map((tag) => (
                    <Tag key={tag.id}>{tag.name}</Tag>
                  ))}
                </Tags>
              </Panel>

              <Panel sx={{ display: 'flex', gap: 2, bgcolor: 'mint.light', boxShadow: 'none' }}>
                <InfoOutlinedIcon sx={{ color: 'success.main' }} aria-hidden />
                <div>
                  <Typography variant="h6" component="h2">
                    {ua.listing.allergensTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ua.listing.allergensText}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {listing.offer.allergens.length > 0 ? (
                      <>
                        {ua.listing.allergensList}{' '}
                        <strong>
                          {listing.offer.allergens.map((a) => a.name.toLowerCase()).join(', ')}
                        </strong>
                      </>
                    ) : (
                      ua.listing.noAllergens
                    )}
                  </Typography>
                </div>
              </Panel>

              <Panel>
                <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                  {ua.listing.howTitle}
                </Typography>
                <Steps>
                  {ua.listing.howSteps.map((step) => (
                    <li key={step.title}>
                      <Typography variant="subtitle1" component="h3">
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.text}
                      </Typography>
                    </li>
                  ))}
                </Steps>
              </Panel>

              <Panel>
                <VenueHeader>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <VenueIcon aria-hidden>
                      <StorefrontOutlinedIcon />
                    </VenueIcon>
                    <div>
                      <Typography variant="overline" component="p" sx={{ color: 'success.main' }}>
                        {ua.listing.venueTitle}
                      </Typography>
                      <MuiLink
                        component={NextLink}
                        href={`/venues/${listing.venue.slug}`}
                        variant="h5"
                        color="text.primary"
                      >
                        {listing.venue.name}
                      </MuiLink>
                      <Typography variant="body2" color="text.secondary">
                        {listing.venue.address}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    href={directionsUrl(listing.venue.lat, listing.venue.lng)}
                    target="_blank"
                    rel="noopener"
                    variant="outlined"
                    startIcon={<DirectionsOutlinedIcon />}
                  >
                    {ua.common.route}
                  </Button>
                </VenueHeader>
                {mapsEnabled && (
                  <MapBox>
                    <VenueLocationMap point={{ lat: listing.venue.lat, lng: listing.venue.lng }} />
                  </MapBox>
                )}
              </Panel>
            </Column>

            <div id="booking" style={{ scrollMarginTop: 96 }}>
              <BookingCard listing={listing} />
              {listing.venue.phone && (
                <PhoneCard href={`tel:${listing.venue.phone}`}>
                  <PhoneOutlinedIcon aria-hidden />
                  <div style={{ flex: 1 }}>
                    <Typography variant="subtitle2">{ua.listing.phoneTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.venue.phone}
                    </Typography>
                  </div>
                  <ChevronRightIcon aria-hidden />
                </PhoneCard>
              )}
            </div>
          </Layout>

          {nearby.data && nearby.data.length > 0 && (
            <section style={{ marginTop: 56 }}>
              <SectionHeading overline={ua.listing.nearbyOverline} title={ua.listing.nearbyTitle} />
              <ListingGrid
                listings={
                  point
                    ? withDistanceFrom(nearby.data.slice(0, 3), point, false)
                    : nearby.data.slice(0, 3).map((l) => ({ ...l, distanceM: null }))
                }
                columns={3}
              />
            </section>
          )}
        </PageContainer>
        {listing.status === 'on_sale' && listing.quantityLeft > 0 && (
          <MobileBar>
            <PriceTag price={listing.price} originalPrice={listing.originalPrice} />
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: 'primary.dark' }}
              onClick={() =>
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {ua.listingCard.book}
            </Button>
          </MobileBar>
        )}
      </PageMain>
    </>
  );
}
