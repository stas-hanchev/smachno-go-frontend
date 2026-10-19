'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';

const Chip = styled(RouterLink, { name: 'SgLocationChip', slot: 'Chip' })<{
  $variant: 'pill' | 'button';
}>(({ theme, $variant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  maxWidth: 220,
  padding: $variant === 'pill' ? '6px 12px' : '12px 16px',
  borderRadius: $variant === 'pill' ? 9999 : 12,
  backgroundColor: theme.palette.mint.light,
  color: $variant === 'pill' ? theme.palette.text.secondary : theme.palette.text.primary,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms',
  '&:hover': { backgroundColor: '#D3F1EA' },
  '& > span': { overflow: 'hidden', textOverflow: 'ellipsis' },
  '& svg': { fontSize: 18, flexShrink: 0 },
}));

export function LocationChip({ variant = 'pill' }: { variant?: 'pill' | 'button' }) {
  const { label } = useSearchArea();
  return (
    <Chip href="/location" $variant={variant} aria-label={ua.location.chip}>
      <PlaceOutlinedIcon aria-hidden />
      <span>{label ?? ua.location.title}</span>
      <ExpandMoreIcon aria-hidden />
    </Chip>
  );
}
