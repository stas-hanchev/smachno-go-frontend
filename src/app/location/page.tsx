'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateMe } from '@/api/me';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { PointPicker } from '@/components/maps/LazyMaps';
import { ToggleChips } from '@/components/ui/FilterChips';
import { useCities } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { mapsEnabled } from '@/lib/env';
import { nearestCity, type LatLng } from '@/lib/geo';
import { useLocationStore, type LocationSource } from '@/stores/location';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';

const Card = styled('section', { name: 'SgLocation', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 20,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('sm')]: { padding: 32 },
}));

interface Draft {
  point: LatLng | null;
  label: string | null;
  cityId: number | null;
  source: LocationSource;
}

export default function LocationPage() {
  const hydrated = useLocationStore((s) => s.hydrated);
  if (!hydrated) return null;
  return <LocationForm />;
}

function LocationForm() {
  const router = useRouter();
  const cities = useCities();
  const user = useSessionStore((s) => s.user);
  const [draft, setDraft] = useState<Draft>(() => {
    const { point, label, cityId, source } = useLocationStore.getState();
    return { point, label, cityId, source };
  });
  const [radiusKm, setRadiusKm] = useState(() => useLocationStore.getState().radiusKm);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const saveToProfile = useMutation({ mutationFn: updateMe });

  function cityIdFor(point: LatLng) {
    return cities.data ? (nearestCity(cities.data, point)?.id ?? null) : null;
  }

  function locate() {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude };
        setDraft({ point, label: ua.location.myLocation, cityId: cityIdFor(point), source: 'geo' });
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  function chooseCity(id: number) {
    const city = cities.data?.find((c) => c.id === id);
    if (!city) return;
    setDraft({
      point: { lat: city.centerLat, lng: city.centerLng },
      label: ua.location.centerOf(city.name),
      cityId: city.id,
      source: 'city',
    });
  }

  function apply() {
    if (!draft.point) return;
    const state = useLocationStore.getState();
    state.setLocation({
      point: draft.point,
      label: draft.label,
      cityId: draft.cityId,
      source: draft.source,
    });
    state.setRadius(radiusKm);
    if (user) {
      saveToProfile.mutate({
        homeLat: draft.point.lat,
        homeLng: draft.point.lng,
        homeAddress: draft.label,
        cityId: draft.cityId,
        searchRadiusKm: radiusKm,
      });
    }
    router.push('/');
  }

  return (
    <>
      <PageMain>
        <PageContainer sx={{ maxWidth: 760 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} aria-label={ua.common.back}>
              <ArrowBackIcon />
            </IconButton>
            <div>
              <Typography variant="h2" component="h1">
                {ua.location.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ua.location.subtitle}
              </Typography>
            </div>
          </Stack>

          <Card>
            <div>
              <Button
                variant="contained"
                startIcon={<MyLocationIcon />}
                onClick={locate}
                disabled={locating}
                size="large"
              >
                {locating ? ua.location.locating : ua.location.useMyLocation}
              </Button>
              {geoError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {ua.location.geoDenied}
                </Alert>
              )}
            </div>

            <div>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {ua.location.city}
              </Typography>
              <ToggleChips
                label={ua.location.city}
                values={draft.source === 'city' && draft.cityId !== null ? [draft.cityId] : []}
                options={(cities.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
                onToggle={chooseCity}
              />
            </div>

            <div>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {ua.location.address}
              </Typography>
              {mapsEnabled ? (
                <Stack spacing={2}>
                  <AddressAutocomplete
                    near={draft.point}
                    onSelect={({ point, address }) =>
                      setDraft({
                        point,
                        label: address,
                        cityId: cityIdFor(point),
                        source: 'address',
                      })
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    {ua.location.pickOnMap}
                  </Typography>
                  <PointPicker
                    point={draft.point}
                    onPick={(point) =>
                      setDraft({
                        point,
                        label: ua.location.pickedPoint,
                        cityId: cityIdFor(point),
                        source: 'map',
                      })
                    }
                  />
                </Stack>
              ) : (
                <Alert severity="info">{ua.location.addressUnavailable}</Alert>
              )}
            </div>

            <div>
              <Typography variant="subtitle2" id="radius-label">
                {ua.location.radius}: {ua.common.km(radiusKm)}
              </Typography>
              <Slider
                aria-labelledby="radius-label"
                value={radiusKm}
                min={1}
                max={30}
                step={1}
                marks={[1, 5, 10, 20, 30].map((v) => ({ value: v, label: ua.common.km(v) }))}
                onChange={(_e, value) => setRadiusKm(value as number)}
                sx={{ mt: 1 }}
              />
            </div>

            {draft.label && (
              <Typography variant="body2" color="text.secondary">
                {draft.label}
              </Typography>
            )}

            <Button variant="contained" size="large" onClick={apply} disabled={!draft.point}>
              {ua.location.apply}
            </Button>
          </Card>
        </PageContainer>
      </PageMain>
    </>
  );
}
