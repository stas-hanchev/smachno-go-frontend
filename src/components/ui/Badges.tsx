'use client';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { styled } from '@mui/material/styles';
import { ua } from '@/i18n/ua';

export const DiscountBadge = styled('span', { name: 'SgBadges', slot: 'DiscountBadge' })(
  ({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 8,
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  }),
);

export const PillBadge = styled('span', { name: 'SgBadges', slot: 'PillBadge' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  borderRadius: 9999,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
  '& svg': { fontSize: 15 },
}));

const Rating = styled('span', { name: 'SgBadges', slot: 'Rating' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 4,
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.text.primary,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  '& svg': { fontSize: 16, color: theme.palette.success.main },
}));

export function RatingBadge({ rating }: { rating: string | null }) {
  if (rating === null) return <Rating>{ua.listingCard.newVenue}</Rating>;
  return (
    <Rating>
      <StarRoundedIcon aria-hidden />
      {Number(rating).toFixed(1)}
    </Rating>
  );
}

export const Dot = styled('span', { name: 'SgBadges', slot: 'Dot' })(({ theme }) => ({
  width: 4,
  height: 4,
  borderRadius: 9999,
  backgroundColor: theme.palette.divider,
  flexShrink: 0,
}));
