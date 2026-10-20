'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { getVenue, getVenueListings } from '@/api/catalog';
import type { ListingCard, VenueDetails } from '@/api/types';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { PillBadge } from '@/components/ui/Badges';
import { EmptyState } from '@/components/ui/EmptyState';
import { FavoriteIconButton } from '@/components/ui/FavoriteButton';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ShareIconButton } from '@/components/ui/ShareButton';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { directionsUrl, formatDistance, kyivWeekday } from '@/lib/format';
import { shadows } from '@/theme/theme';

const FALLBACK_COVER = '/images/hero-pastry.jpg';

const Hero = styled('section', { name: 'SgVenueView', slot: 'Hero' })<{ $image: string }>(
  ({ theme, $image }) => ({
    position: 'relative',
    minHeight: 280,
    borderRadius: 24,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    backgroundImage: `linear-gradient(180deg, rgba(13,31,28,0.05) 0%, rgba(13,31,28,0.85) 100%), url("${$image}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: shadows.raised,
    color: theme.palette.common.white,
    [theme.breakpoints.up('md')]: { minHeight: 360 },
  }),
);

const HeroActions = styled('div', { name: 'SgVenueView', slot: 'HeroActions' })({
  position: 'absolute',
  top: 16,
  right: 16,
  display: 'flex',
  gap: 8,
});

const HeroContent = styled('div', { name: 'SgVenueView', slot: 'HeroContent' })(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 16,
  padding: 20,
  [theme.breakpoints.up('md')]: { padding: 32 },
}));

const Chip = styled('span', { name: 'SgVenueView', slot: 'Chip' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 12px',
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  color: theme.palette.text.primary,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  '& svg': { fontSize: 16, color: theme.palette.success.main },
  '& small': { fontWeight: 400, color: theme.palette.text.secondary, fontSize: 13 },
}));

const InfoGrid = styled('div', { name: 'SgVenueView', slot: 'InfoGrid' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  margin: '24px 0 48px',
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 },
}));

const HowBanner = styled('section', { name: 'SgVenueView', slot: 'HowBanner' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
  marginTop: 48,
  padding: 24,
  borderRadius: 24,
  background: 'linear-gradient(90deg, #DEF2EE 0%, #E9FEF9 100%)',
  [theme.breakpoints.up('md')]: { padding: 32 },
}));

const HowIcon = styled('span', { name: 'SgVenueView', slot: 'HowIcon' })(({ theme }) => ({
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.dark,
}));

const Hours = styled('ul', { name: 'SgVenueView', slot: 'Hours' })(({ theme }) => ({
  listStyle: 'none',
  margin: '8px 0 0',
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  columnGap: 12,
  fontSize: 13,
  lineHeight: '18px',
  color: theme.palette.text.secondary,
  '& li': { display: 'contents' },
  '& .today': { fontWeight: 700, color: theme.palette.text.primary },
}));

function hoursLine(venue: VenueDetails, weekday: number) {
  const h = venue.hours.find((x) => x.weekday === weekday);
  if (!h || h.isClosed) return null;
  return { from: h.opensAt.slice(0, 5), to: h.closesAt.slice(0, 5) };
}

export function VenueView({
  slug,
  initialVenue,
  initialListings,
}: {
  slug: string;
  initialVenue: VenueDetails;
  initialListings: ListingCard[];
}) {
  const { point, ready } = useSearchArea();
  const venue =
    useQuery({
      queryKey: ['venue', slug, point],
      queryFn: () => getVenue(slug, point),
      placeholderData: initialVenue,
      enabled: ready,
    }).data ?? initialVenue;
  const listings =
    useQuery({
      queryKey: ['venue-listings', slug],
      queryFn: () => getVenueListings(slug),
      placeholderData: initialListings,
    }).data ?? initialListings;

  const today = kyivWeekday();
  const todayHours = hoursLine(venue, today);
  const distance = formatDistance(venue.distanceM);
  const cover = venue.coverUrl ?? venue.photos[0] ?? FALLBACK_COVER;

  return (
    <PageMain>
      <PageContainer>
        <Breadcrumbs aria-label={ua.venue.breadcrumbs} sx={{ mb: 2, fontSize: 14 }}>
          <MuiLink component={NextLink} href="/" color="inherit">
            {ua.nav.home}
          </MuiLink>
          <MuiLink component={NextLink} href="/search" color="inherit">
            {ua.nav.venues}
          </MuiLink>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {venue.name}
          </Typography>
        </Breadcrumbs>

        <Hero $image={cover}>
          <HeroActions>
            <FavoriteIconButton venueId={venue.id} isFavorite={venue.isFavorite} variant="plain" />
            <ShareIconButton title={venue.name} />
          </HeroActions>
          <HeroContent>
            <div style={{ maxWidth: 640 }}>
              <PillBadge sx={{ mb: 1.5 }}>
                <StorefrontOutlinedIcon aria-hidden />
                {venue.category.name}
              </PillBadge>
              <Typography variant="h1" component="h1">
                {venue.name}
              </Typography>
              {venue.description && (
                <Typography variant="body2" sx={{ mt: 1, color: 'mint.light' }}>
                  {venue.description}
                </Typography>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Chip>
                <StarRoundedIcon aria-hidden />
                {venue.ratingAvg ? (
                  <>
                    {Number(venue.ratingAvg).toFixed(1)}{' '}
                    <small>({ua.venue.reviews(venue.ratingCount)})</small>
                  </>
                ) : (
                  ua.venue.newVenue
                )}
              </Chip>
              {distance && (
                <Chip>
                  <NearMeOutlinedIcon aria-hidden />
                  {ua.venue.fromYou(distance)}
                </Chip>
              )}
            </div>
          </HeroContent>
        </Hero>

        <InfoGrid>
          <InfoCard
            icon={<PlaceOutlinedIcon />}
            label={ua.venue.locationTitle}
            value={venue.address}
          >
            <Typography variant="body2" color="text.secondary">
              {venue.city.name} ·{' '}
              <MuiLink
                href={directionsUrl(venue.lat, venue.lng)}
                target="_blank"
                rel="noopener"
                color="success.main"
              >
                {ua.common.route}
              </MuiLink>
            </Typography>
          </InfoCard>
          <InfoCard
            icon={<AccessTimeIcon />}
            label={ua.venue.hoursTitle}
            value={
              todayHours
                ? ua.venue.hoursToday(todayHours.from, todayHours.to)
                : ua.venue.closedToday
            }
          >
            <Hours>
              {ua.venue.weekdays.map((name, index) => {
                const line = hoursLine(venue, index + 1);
                return (
                  <li key={name} className={index + 1 === today ? 'today' : undefined}>
                    <span className={index + 1 === today ? 'today' : undefined}>{name}</span>
                    <span className={index + 1 === today ? 'today' : undefined}>
                      {line ? `${line.from} – ${line.to}` : ua.venue.closed}
                    </span>
                  </li>
                );
              })}
            </Hours>
          </InfoCard>
          <InfoCard
            icon={<PhoneOutlinedIcon />}
            label={ua.venue.contactTitle}
            value={
              venue.phone ? (
                <MuiLink href={`tel:${venue.phone}`} color="inherit">
                  {venue.phone}
                </MuiLink>
              ) : (
                ua.venue.noPhone
              )
            }
          />
        </InfoGrid>

        <SectionHeading
          overline={ua.venue.setsOverline}
          title={ua.venue.setsTitle}
          subtitle={ua.venue.setsSubtitle}
        />
        {listings.length > 0 ? (
          <ListingGrid listings={listings} columns={3} heading="offer" source="venue" />
        ) : (
          <EmptyState
            icon={<InfoOutlinedIcon />}
            title={ua.venue.setsTitle}
            text={ua.venue.noSets}
          />
        )}

        <HowBanner>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', maxWidth: 760 }}>
            <HowIcon aria-hidden>
              <QrCode2Icon />
            </HowIcon>
            <div>
              <Typography variant="h3" component="h2" sx={{ color: 'primary.dark' }}>
                {ua.venue.howTitle(venue.name)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ua.venue.howText}
              </Typography>
            </div>
          </div>
          <Button
            component={NextLink}
            href="/orders"
            variant="outlined"
            sx={{ bgcolor: 'background.paper' }}
          >
            {ua.nav.orders}
          </Button>
        </HowBanner>
      </PageContainer>
    </PageMain>
  );
}
