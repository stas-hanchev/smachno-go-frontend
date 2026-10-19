'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type MouseEvent } from 'react';
import { errorMessage } from '@/api/client';
import { addFavorite, removeFavorite } from '@/api/me';
import { useRequireLogin } from '@/hooks/useRequireLogin';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

export function useFavoriteToggle(venueId: number, initial: boolean) {
  const queryClient = useQueryClient();
  const requireLogin = useRequireLogin();
  const [isFavorite, setFavorite] = useState(initial);

  const [syncedInitial, setSyncedInitial] = useState(initial);
  if (syncedInitial !== initial) {
    setSyncedInitial(initial);
    setFavorite(initial);
  }

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? addFavorite(venueId) : removeFavorite(venueId)),
    onMutate: (next) => setFavorite(next),
    onSuccess: (_data, next) => {
      notify.success(next ? ua.favorites.added : ua.favorites.removed);
      for (const key of ['favorites', 'listings', 'listing', 'venue', 'venue-listings', 'nearby']) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: (error, next) => {
      setFavorite(!next);
      notify.error(errorMessage(error));
    },
  });

  const toggle = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!requireLogin()) return;
    mutation.mutate(!isFavorite);
  };

  return { isFavorite, toggle, pending: mutation.isPending };
}

export function FavoriteIconButton({
  venueId,
  isFavorite: initial,
  variant = 'overlay',
}: {
  venueId: number;
  isFavorite: boolean;
  variant?: 'overlay' | 'plain';
}) {
  const { isFavorite, toggle, pending } = useFavoriteToggle(venueId, initial);
  return (
    <IconButton
      onClick={toggle}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? ua.venue.favoriteRemove : ua.venue.favoriteAdd}
      sx={{
        width: variant === 'overlay' ? 32 : 40,
        height: variant === 'overlay' ? 32 : 40,
        bgcolor: variant === 'overlay' ? 'rgba(255,255,255,0.85)' : 'background.paper',
        backdropFilter: 'blur(6px)',
        color: isFavorite ? 'error.main' : 'text.primary',
        '&:hover': { bgcolor: 'background.paper' },
      }}
    >
      {isFavorite ? (
        <FavoriteIcon sx={{ fontSize: 18 }} />
      ) : (
        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
      )}
    </IconButton>
  );
}

export function FavoriteTextButton({
  venueId,
  isFavorite: initial,
}: {
  venueId: number;
  isFavorite: boolean;
}) {
  const { isFavorite, toggle, pending } = useFavoriteToggle(venueId, initial);
  return (
    <Button
      variant="outlined"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isFavorite}
      startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      sx={{ flex: 1, borderColor: 'divider', color: isFavorite ? 'error.main' : 'text.primary' }}
    >
      {isFavorite ? ua.listing.inFavorites : ua.listing.favorite}
    </Button>
  );
}
