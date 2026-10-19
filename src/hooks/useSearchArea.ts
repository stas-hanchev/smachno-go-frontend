'use client';

import { useQuery } from '@tanstack/react-query';
import { getCities } from '@/api/catalog';
import { nearestCity } from '@/lib/geo';
import { useLocationStore } from '@/stores/location';

export function useCities() {
  return useQuery({ queryKey: ['cities'], queryFn: getCities, staleTime: Infinity });
}

export function useSearchArea() {
  const cities = useCities();
  const point = useLocationStore((s) => s.point);
  const label = useLocationStore((s) => s.label);
  const radiusKm = useLocationStore((s) => s.radiusKm);
  const source = useLocationStore((s) => s.source);
  const hydrated = useLocationStore((s) => s.hydrated);

  const fallbackCity = cities.data?.[0];
  const effectivePoint =
    point ?? (fallbackCity ? { lat: fallbackCity.centerLat, lng: fallbackCity.centerLng } : null);
  const city =
    cities.data && effectivePoint ? nearestCity(cities.data, effectivePoint) : fallbackCity;

  return {
    point: hydrated ? effectivePoint : null,
    radiusKm,
    city,
    label: label ?? city?.name ?? null,
    isPrecise: source === 'geo' || source === 'address' || source === 'map' || source === 'profile',
    ready: hydrated && effectivePoint !== null,
    citiesError: cities.isError,
  };
}
