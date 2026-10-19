import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LatLng } from '@/lib/geo';

export type LocationSource = 'default' | 'geo' | 'city' | 'address' | 'map' | 'profile';

export const DEFAULT_RADIUS_KM = 5;
export const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20, 30];

interface LocationState {
  point: LatLng | null;
  label: string | null;
  cityId: number | null;
  radiusKm: number;
  source: LocationSource;
  hydrated: boolean;
  geoRequested: boolean;
  setLocation: (input: {
    point: LatLng;
    label: string | null;
    cityId: number | null;
    source: LocationSource;
  }) => void;
  setRadius: (radiusKm: number) => void;
  markGeoRequested: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      point: null,
      label: null,
      cityId: null,
      radiusKm: DEFAULT_RADIUS_KM,
      source: 'default',
      hydrated: false,
      geoRequested: false,
      setLocation: ({ point, label, cityId, source }) => set({ point, label, cityId, source }),
      setRadius: (radiusKm) => set({ radiusKm }),
      markGeoRequested: () => set({ geoRequested: true }),
    }),
    {
      name: 'sg-location',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ point, label, cityId, radiusKm, source, geoRequested }) => ({
        point,
        label,
        cityId,
        radiusKm,
        source,
        geoRequested,
      }),
      onRehydrateStorage: () => () => {
        useLocationStore.setState({ hydrated: true });
      },
    },
  ),
);
