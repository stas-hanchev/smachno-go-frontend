'use client';

import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { RouterLink } from '@/components/ui/RouterLink';
import type { Category } from '@/api/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ua } from '@/i18n/ua';
import { shadows } from '@/theme/theme';

const Grid = styled('div', { name: 'SgCategoryTiles', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 },
  [theme.breakpoints.up('lg')]: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
}));

const Tile = styled(RouterLink, { name: 'SgCategoryTiles', slot: 'Tile' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 4,
  padding: 20,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  textDecoration: 'none',
  color: theme.palette.text.primary,
  transition: 'box-shadow 150ms, transform 150ms',
  '&:hover': { boxShadow: shadows.raised, transform: 'translateY(-2px)' },
}));

const IconBox = styled('span', { name: 'SgCategoryTiles', slot: 'IconBox' })(({ theme }) => ({
  width: 64,
  height: 64,
  marginBottom: 8,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(145, 242, 209, 0.4)',
  color: theme.palette.primary.dark,
  '& svg': { fontSize: 30 },
}));

const Name = styled('span', { name: 'SgCategoryTiles', slot: 'Name' })({
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 700,
});
const Count = styled('span', { name: 'SgCategoryTiles', slot: 'Count' })(({ theme }) => ({
  fontSize: 14,
  lineHeight: '20px',
  color: theme.palette.text.secondary,
}));

export function CategoryTiles({
  categories,
  loading,
}: {
  categories: Category[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={156} sx={{ borderRadius: '20px' }} />
        ))}
      </Grid>
    );
  }
  return (
    <Grid>
      {categories.map((category) => (
        <Tile key={category.id} href={`/search?categoryIds=${category.id}`}>
          <IconBox aria-hidden>
            <CategoryIcon icon={category.icon} name={category.name} />
          </IconBox>
          <Name>{category.name}</Name>
          {category.activeListings !== undefined && (
            <Count>{ua.home.offersCount(category.activeListings)}</Count>
          )}
        </Tile>
      ))}
    </Grid>
  );
}
