'use client';

import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import { DiscountBadge, Dot, RatingBadge } from '@/components/ui/Badges';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ua } from '@/i18n/ua';
import { formatDistance, formatPrice } from '@/lib/format';
import type { VenueSummary } from '@/lib/venues-from-listings';
import { shadows } from '@/theme/theme';

const Card = styled(RouterLink, { name: 'SgVenueSummaryCard', slot: 'Card' })<{ $active: boolean }>(
  ({ theme, $active }) => ({
    display: 'flex',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: theme.palette.background.paper,
    boxShadow: shadows.card,
    outline: $active ? `2px solid ${theme.palette.success.main}` : 'none',
    transition: 'box-shadow 150ms',
    '&:hover': { boxShadow: shadows.raised },
  }),
);

const Icon = styled('span', { name: 'SgVenueSummaryCard', slot: 'Icon' })(({ theme }) => ({
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.success.main,
}));

const Meta = styled('div', { name: 'SgVenueSummaryCard', slot: 'Meta' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  marginTop: 4,
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
  '& svg': { fontSize: 14, verticalAlign: '-2px', marginRight: 2 },
}));

export function VenueSummaryCard({
  venue,
  active = false,
  onHover,
}: {
  venue: VenueSummary;
  active?: boolean;
  onHover?: (id: number | null) => void;
}) {
  const distance = formatDistance(venue.distanceM);
  return (
    <Card
      href={`/venues/${venue.slug}`}
      $active={active}
      onMouseEnter={() => onHover?.(venue.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Icon aria-hidden>
        <CategoryIcon name={venue.categoryName} />
      </Icon>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
        >
          <Typography variant="h6" component="h3" noWrap>
            {venue.name}
          </Typography>
          <RatingBadge rating={venue.ratingAvg} />
        </div>
        <Typography variant="body2" color="text.secondary" noWrap>
          {venue.address}
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
          <span>{ua.map.sets(venue.listingsCount)}</span>
          <Dot aria-hidden />
          <span>{ua.map.from(formatPrice(venue.minPrice))}</span>
          <DiscountBadge style={{ padding: '0 8px', fontSize: 12 }}>
            −{venue.maxDiscount}%
          </DiscountBadge>
        </Meta>
      </div>
    </Card>
  );
}
