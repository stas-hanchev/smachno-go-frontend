'use client';

import { useEffect } from 'react';
import { useCities } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { nearestCity } from '@/lib/geo';
import { useLocationStore } from '@/stores/location';
import { useSessionStore } from '@/stores/session';

export function LocationBootstrap() {
  const hydrated = useLocationStore((s) => s.hydrated);
  const geoRequested = useLocationStore((s) => s.geoRequested);
  const source = useLocationStore((s) => s.source);
  const user = useSessionStore((s) => s.user);
  const cities = useCities();

  useEffect(() => {
    void useLocationStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hydrated || geoRequested || !navigator.geolocation) return;
    useLocationStore.getState().markGeoRequested();
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (useLocationStore.getState().source !== 'default') return;
        const point = { lat: coords.latitude, lng: coords.longitude };
        const city = cities.data ? nearestCity(cities.data, point) : undefined;
        useLocationStore.getState().setLocation({
          point,
          label: ua.location.myLocation,
          cityId: city?.id ?? null,
          source: 'geo',
        });
      },
      () => {},
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }, [hydrated, geoRequested, cities.data]);

  useEffect(() => {
    if (!hydrated || source !== 'default' || !user) return;
    if (user.homeLat === null || user.homeLng === null) return;
    useLocationStore.getState().setLocation({
      point: { lat: user.homeLat, lng: user.homeLng },
      label: user.homeAddress,
      cityId: user.cityId,
      source: 'profile',
    });
    useLocationStore.getState().setRadius(user.searchRadiusKm);
  }, [hydrated, source, user]);

  return null;
}
