'use client';

import { styled } from '@mui/material/styles';
import { ua } from '@/i18n/ua';
import { formatPrice } from '@/lib/format';

const Wrapper = styled('div', { name: 'SgPriceTag', slot: 'Wrapper' })<{ $inline: boolean }>(
  ({ $inline }) => ({
    display: 'flex',
    flexDirection: $inline ? 'row-reverse' : 'column',
    justifyContent: $inline ? 'flex-end' : 'flex-start',
    alignItems: $inline ? 'baseline' : 'flex-start',
    gap: $inline ? 8 : 1.5,
  }),
);

const Old = styled('s', { name: 'SgPriceTag', slot: 'Old' })(({ theme }) => ({
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.muted,
}));

const Current = styled('span', { name: 'SgPriceTag', slot: 'Current' })<{
  $size: 'medium' | 'large';
}>(({ theme, $size }) => ({
  fontSize: $size === 'large' ? 36 : 20,
  lineHeight: $size === 'large' ? '44px' : '28px',
  fontWeight: 800,
  color: theme.palette.primary.dark,
}));

export function PriceTag({
  price,
  originalPrice,
  size = 'medium',
  inline = false,
}: {
  price: string;
  originalPrice: string;
  size?: 'medium' | 'large';
  inline?: boolean;
}) {
  return (
    <Wrapper $inline={inline}>
      <Old aria-label={ua.common.oldPrice(formatPrice(originalPrice))}>
        {formatPrice(originalPrice)}
      </Old>
      <Current $size={size}>{formatPrice(price)}</Current>
    </Wrapper>
  );
}
