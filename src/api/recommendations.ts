import type { LatLng } from '@/lib/geo';
import { api } from './client';
import type { ListingCard } from './types';

export async function getRecommendations(point: LatLng, radiusKm: number, limit = 12) {
  const { data } = await api.get<{ data: ListingCard[]; meta: { personalized: boolean } }>(
    '/recommendations',
    { params: { ...point, radiusKm, limit } },
  );
  return data;
}

export async function getDailyOffer(point: LatLng, radiusKm: number) {
  const { data } = await api.get<{ listing: ListingCard | null; personalized: boolean }>(
    '/recommendations/daily',
    { params: { ...point, radiusKm } },
  );
  return data;
}
