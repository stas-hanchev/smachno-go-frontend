'use client';

import RestaurantIcon from '@mui/icons-material/Restaurant';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import { ua } from '@/i18n/ua';

const LogoLink = styled(RouterLink, { name: 'SgLogo', slot: 'LogoLink' })({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  flexShrink: 0,
});

const Mark = styled('span', { name: 'SgLogo', slot: 'Mark' })<{ $size: number }>(
  ({ theme, $size }) => ({
    width: $size,
    height: $size,
    borderRadius: $size >= 40 ? 12 : 8,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  }),
);

const Word = styled('span', { name: 'SgLogo', slot: 'Word' })<{ $size: number }>(
  ({ theme, $size }) => ({
    fontSize: $size,
    lineHeight: 1.3,
    fontWeight: 800,
    letterSpacing: $size >= 24 ? '-0.6px' : '-0.3px',
    color: theme.palette.primary.dark,
    '& > span': { color: theme.palette.success.main },
  }),
);

export function Logo({ size = 'large' }: { size?: 'large' | 'small' }) {
  const mark = size === 'large' ? 40 : 32;
  const font = size === 'large' ? 24 : 20;
  return (
    <LogoLink href="/" aria-label={`${ua.brand.first}${ua.brand.second}`}>
      <Mark $size={mark} aria-hidden>
        <RestaurantIcon sx={{ fontSize: mark * 0.5 }} />
      </Mark>
      <Word $size={font}>
        {ua.brand.first}
        <span>{ua.brand.second}</span>
      </Word>
    </LogoLink>
  );
}
