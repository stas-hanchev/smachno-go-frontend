'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { ua } from '@/i18n/ua';

const Wrapper = styled('div', { name: 'SgQuantityStepper', slot: 'Wrapper' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  borderRadius: 9999,
  backgroundColor: theme.palette.mint.light,
  '& output': { minWidth: 32, textAlign: 'center', fontWeight: 800, fontSize: 18 },
}));

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <Wrapper role="group" aria-label={label}>
      <IconButton
        size="small"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={ua.listing.decrease}
        sx={{ bgcolor: 'background.paper' }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <output aria-live="polite">{value}</output>
      <IconButton
        size="small"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={ua.listing.increase}
        sx={{ bgcolor: 'background.paper' }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Wrapper>
  );
}
