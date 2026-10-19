'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import type { ListingCard } from '@/api/types';
import { PillBadge } from '@/components/ui/Badges';
import { ua } from '@/i18n/ua';
import { formatPickupWindow } from '@/lib/format';
import { shadows } from '@/theme/theme';

const FALLBACK_IMAGE = '/images/hero-pastry.jpg';

const Banner = styled('section', { name: 'SgHeroOffer', slot: 'Banner' })<{ $image: string }>(
  ({ theme, $image }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    minHeight: 220,
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: theme.palette.primary.dark,
    backgroundImage: `linear-gradient(90deg, rgba(13,31,28,0.9) 0%, rgba(13,31,28,0.7) 50%, rgba(13,31,28,0) 100%), url("${$image}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: shadows.raised,
    [theme.breakpoints.up('md')]: { minHeight: 380, alignItems: 'center' },
  }),
);

const Content = styled('div', { name: 'SgHeroOffer', slot: 'Content' })(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 12,
  padding: 20,
  maxWidth: 672,
  color: theme.palette.common.white,
  [theme.breakpoints.up('md')]: { padding: 48, gap: 20 },
}));

const Actions = styled('div', { name: 'SgHeroOffer', slot: 'Actions' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 16,
  paddingTop: 8,
});

const Glass = styled('span', { name: 'SgHeroOffer', slot: 'Glass' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 12,
  backgroundColor: 'rgba(56, 60, 59, 0.4)',
  backdropFilter: 'blur(6px)',
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.common.white,
  '& svg': { fontSize: 16 },
}));

const Cta = styled(Button, { name: 'SgHeroOffer', slot: 'Cta' })({
  backgroundColor: '#91F2D1',
  color: '#007058',
  '&:hover': { backgroundColor: '#7FE6C3' },
}) as typeof Button;

const DesktopText = styled(Typography, { name: 'SgHeroOffer', slot: 'DesktopText' })(
  ({ theme }) => ({
    display: 'none',
    color: theme.palette.mint.light,
    maxWidth: 512,
    [theme.breakpoints.up('md')]: { display: 'block' },
  }),
) as typeof Typography;

export function HeroOffer({ listing, loading }: { listing: ListingCard | null; loading: boolean }) {
  if (loading) {
    return (
      <Skeleton variant="rounded" sx={{ borderRadius: '24px', height: { xs: 220, md: 380 } }} />
    );
  }

  if (!listing) {
    return (
      <Banner $image={FALLBACK_IMAGE}>
        <Content>
          <Typography variant="h1" component="h1">
            {ua.home.heroFallbackTitle}
          </Typography>
          <DesktopText variant="body1">{ua.home.heroFallbackText}</DesktopText>
          <Actions>
            <Cta component={Link} href="/search" size="large" endIcon={<ArrowForwardIcon />}>
              {ua.home.heroFallbackCta}
            </Cta>
          </Actions>
        </Content>
      </Banner>
    );
  }

  return (
    <Banner $image={listing.offer.photoUrl ?? FALLBACK_IMAGE}>
      <Content>
        <PillBadge>
          <BoltIcon aria-hidden />
          {ua.home.heroTag}
        </PillBadge>
        <Typography variant="h1" component="h1">
          −{listing.discountPercent}% · {listing.offer.title}
        </Typography>
        <DesktopText variant="body1">
          {ua.home.heroText(
            listing.venue.name,
            listing.venue.address,
            formatPickupWindow(listing.pickupStart, listing.pickupEnd),
          )}
        </DesktopText>
        <Actions>
          <Cta
            component={Link}
            href={`/listings/${listing.id}`}
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            {ua.home.heroCta}
          </Cta>
          <Glass>
            <TimerOutlinedIcon aria-hidden />
            {ua.home.heroLeft(listing.quantityLeft)}
          </Glass>
        </Actions>
      </Content>
    </Banner>
  );
}
