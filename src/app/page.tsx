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
import type { ListingCard as ListingCardData, ListingSort } from '@/api/types';
import { ListingCard } from '@/components/ListingCard';
import { distanceMeters, nearestCity, type LatLng } from '@/lib/geo';

const SORT_LABELS: Record<ListingSort, string> = {
  distance: 'Найближчі',
  pickup: 'Час видачі',
  discount: 'Найбільша знижка',
  price: 'Найдешевші',
  rating: 'Рейтинг закладу',
};

const RADIUS_OPTIONS_KM = [5, 10, 20, 30];
const CITY_RADIUS_KM = 30;
const PAGE_SIZE = 24;

function withDistanceFrom(listings: ListingCardData[], from: LatLng, sort: ListingSort) {
  const result = listings.map((listing) => ({
    ...listing,
    distanceM: distanceMeters(from, { lat: listing.venue.lat, lng: listing.venue.lng }),
  }));
  if (sort === 'distance') result.sort((a, b) => a.distanceM - b.distanceM);
  return result;
}

export default function CatalogPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<ListingSort>('distance');
  const [radiusKm, setRadiusKm] = useState(RADIUS_OPTIONS_KM[0]!);
  const [geo, setGeo] = useState<LatLng | null>(null);
  const deferredQ = useDeferredValue(q.trim());

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setGeo({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }, []);

  const cities = useQuery({ queryKey: ['cities'], queryFn: getCities, staleTime: Infinity });
  const city = cities.data && (geo ? nearestCity(cities.data, geo) : cities.data[0]);
  const cityCenter = city ? { lat: city.centerLat, lng: city.centerLng } : null;
  const point = geo ?? cityCenter;

  const listings = useQuery({
    queryKey: ['listings', { q: deferredQ, sort, point, radiusKm }],
    queryFn: () =>
      searchListings({ ...point, radiusKm, q: deferredQ || undefined, sort, limit: PAGE_SIZE }),
    enabled: point !== null || cities.isError,
    placeholderData: keepPreviousData,
  });

  const nothingNearby =
    geo !== null && !listings.isPlaceholderData && listings.data?.data.length === 0;

  const cityListings = useQuery({
    queryKey: ['listings', { q: deferredQ, sort, point: cityCenter, radiusKm: CITY_RADIUS_KM }],
    queryFn: () =>
      searchListings({
        ...cityCenter,
        radiusKm: CITY_RADIUS_KM,
        q: deferredQ || undefined,
        sort,
        limit: PAGE_SIZE,
      }),
    enabled: nothingNearby && cityCenter !== null,
  });

  const showCityFallback = nothingNearby && cityCenter !== null;
  const activeQuery = showCityFallback ? cityListings : listings;
  const items =
    showCityFallback && geo && cityListings.data
      ? withDistanceFrom(cityListings.data.data, geo, sort)
      : activeQuery.data?.data;

  return (
    <Container component="main" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Смачне поруч зі знижкою
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {geo ? 'Набори поблизу вас' : city ? `Набори в місті ${city.name}` : 'Набори від закладів'}
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
          label="Радіус"
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          sx={{ minWidth: 140 }}
        >
          {RADIUS_OPTIONS_KM.map((km) => (
            <MenuItem key={km} value={km}>
              {km} км
            </MenuItem>
          ))}
        </TextField>
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

      {activeQuery.isError && <Alert severity="error">{errorMessage(activeQuery.error)}</Alert>}

      {showCityFallback && city && (cityListings.data?.data.length ?? 0) > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          У радіусі {radiusKm} км від вас наборів немає. Показуємо набори в місті {city.name}.
        </Alert>
      )}

      <Grid container spacing={2}>
        {activeQuery.isPending
          ? Array.from({ length: 6 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
          : items?.map((listing) => (
              <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
      </Grid>

      {items?.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Поруч поки немає наборів. Спробуйте змінити пошук або загляньте пізніше.
        </Typography>
      )}
    </Container>
  );
}
