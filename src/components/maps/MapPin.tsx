'use client';

import PlaceIcon from '@mui/icons-material/Place';
import { styled } from '@mui/material/styles';

const Pin = styled('span', { name: 'SgMapPin', slot: 'Pin' })(({ theme }) => ({
  display: 'block',
  color: theme.palette.primary.main,
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
  lineHeight: 0,
  '& svg': { fontSize: 40 },
}));

export function MapPin() {
  return (
    <Pin aria-hidden>
      <PlaceIcon />
    </Pin>
  );
}
