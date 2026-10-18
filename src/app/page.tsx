'use client';

import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useState } from 'react';
import { getCities, searchListings } from '@/api/catalog';
import { errorMessage } from '@/api/client';
import type { ListingSort } from '@/api/types';
import { ListingCard } from '@/components/ListingCard';

interface Point {
  lat: number;
  lng: number;
}

const SORT_LABELS: Record<ListingSort, string> = {
  distance: 'Найближчі',
  pickup: 'Час видачі',
  discount: 'Найбільша знижка',
  price: 'Найдешевші',
  rating: 'Рейтинг закладу',
};

export default function CatalogPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<ListingSort>('distance');
  const [geo, setGeo] = useState<Point | null>(null);
  const deferredQ = useDeferredValue(q.trim());

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setGeo({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }, []);

  const cities = useQuery({ queryKey: ['cities'], queryFn: getCities, staleTime: Infinity });
  const fallbackCity = cities.data?.[0];
  const point =
    geo ?? (fallbackCity ? { lat: fallbackCity.centerLat, lng: fallbackCity.centerLng } : null);

  const listings = useQuery({
    queryKey: ['listings', { q: deferredQ, sort, point }],
    queryFn: () => searchListings({ ...point, q: deferredQ || undefined, sort, limit: 24 }),
    enabled: point !== null || cities.isError,
    placeholderData: keepPreviousData,
  });

  return (
    <Container component="main" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Смачне поруч зі знижкою
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {geo
          ? 'Набори поблизу вас'
          : fallbackCity
            ? `Набори в місті ${fallbackCity.name}`
            : 'Набори від закладів'}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Пошук"
          placeholder="Випічка, суші, назва закладу"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Сортування"
          value={sort}
          onChange={(e) => setSort(e.target.value as ListingSort)}
          sx={{ minWidth: 220 }}
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {listings.isError && <Alert severity="error">{errorMessage(listings.error)}</Alert>}

      <Grid container spacing={2}>
        {listings.isPending
          ? Array.from({ length: 6 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
          : listings.data?.data.map((listing) => (
              <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
      </Grid>

      {listings.data?.data.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Поруч поки немає наборів. Спробуйте змінити пошук або загляньте пізніше.
        </Typography>
      )}
    </Container>
  );
}
