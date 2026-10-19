'use client';

import { styled } from '@mui/material/styles';
import { CategoryIcon } from './CategoryIcon';

const Box = styled('div', { name: 'SgPhotoPlaceholder', slot: 'Box' })(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.mint.light} 0%, #DEF2EE 55%, #C9EDE3 100%)`,
  color: theme.palette.success.main,
  '& svg': { fontSize: 56, opacity: 0.55 },
}));

const Img = styled('img', { name: 'SgPhotoPlaceholder', slot: 'Img' })({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export function ListingPhoto({
  src,
  alt,
  categoryName,
}: {
  src: string | null;
  alt: string;
  categoryName?: string;
}) {
  if (src) return <Img src={src} alt={alt} loading="lazy" />;
  return (
    <Box aria-hidden>
      <CategoryIcon name={categoryName} />
    </Box>
  );
}
