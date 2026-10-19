'use client';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { errorMessage } from '@/api/client';
import { addFavorite, listFavorites, removeFavorite } from '@/api/me';
import type { FavoriteVenue } from '@/api/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { RatingBadge } from '@/components/ui/Badges';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';

const Grid = styled('div', { name: 'SgFavorites', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 20,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.up('lg')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
}));

const Card = styled('article', { name: 'SgFavorites', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 20,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Icon = styled('span', { name: 'SgFavorites', slot: 'Icon' })(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.success.main,
}));

function FavoriteCard({ favorite }: { favorite: FavoriteVenue }) {
  const queryClient = useQueryClient();
  const { venue } = favorite;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['favorites'] });

  const remove = useMutation({
    mutationFn: () => removeFavorite(venue.id),
    onSuccess: () => {
      notify.success(ua.favorites.removed);
      void refresh();
    },
    onError: (error) => notify.error(errorMessage(error)),
  });
  const toggleNotify = useMutation({
    mutationFn: (value: boolean) => addFavorite(venue.id, value),
    onSuccess: () => void refresh(),
    onError: (error) => notify.error(errorMessage(error)),
  });

  return (
    <Card>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Icon aria-hidden>
          <CategoryIcon name={venue.category.name} />
        </Icon>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            component={NextLink}
            href={`/venues/${venue.slug}`}
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {venue.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {venue.category.name} · {venue.address}
          </Typography>
        </div>
        <RatingBadge rating={venue.ratingAvg} />
      </div>
      <Typography
        variant="subtitle2"
        sx={{ color: favorite.activeListings > 0 ? 'success.main' : 'muted' }}
      >
        {ua.favorites.activeSets(favorite.activeListings)}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={
              toggleNotify.isPending
                ? (toggleNotify.variables ?? favorite.notifyNewListings)
                : favorite.notifyNewListings
            }
            onChange={(e) => toggleNotify.mutate(e.target.checked)}
          />
        }
        label={<Typography variant="body2">{ua.favorites.notify}</Typography>}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Button
          component={NextLink}
          href={`/venues/${venue.slug}`}
          variant="contained"
          sx={{ flex: 1 }}
        >
          {ua.map.openVenue}
        </Button>
        <Button color="error" onClick={() => remove.mutate()} disabled={remove.isPending}>
          {ua.favorites.remove}
        </Button>
      </div>
    </Card>
  );
}

function FavoritesList() {
  const favorites = useQuery({ queryKey: ['favorites'], queryFn: listFavorites });

  if (favorites.isPending) {
    return (
      <Grid>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: '20px' }} />
        ))}
      </Grid>
    );
  }
  if (favorites.isError) return <Alert severity="error">{errorMessage(favorites.error)}</Alert>;
  if (favorites.data.length === 0) {
    return (
      <EmptyState
        icon={<FavoriteBorderIcon />}
        title={ua.favorites.emptyTitle}
        text={ua.favorites.emptyText}
        action={
          <Button component={NextLink} href="/search" variant="contained">
            {ua.orders.find}
          </Button>
        }
      />
    );
  }
  return (
    <Grid>
      {favorites.data.map((favorite) => (
        <FavoriteCard key={favorite.venue.id} favorite={favorite} />
      ))}
    </Grid>
  );
}

export default function FavoritesPage() {
  return (
    <PageMain>
      <PageContainer>
        <SectionHeading level="h1" title={ua.favorites.title} subtitle={ua.favorites.subtitle} />
        <RequireAuth>
          <FavoritesList />
        </RequireAuth>
      </PageContainer>
    </PageMain>
  );
}
