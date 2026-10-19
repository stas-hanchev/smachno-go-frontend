import type { LatLng } from '@/lib/geo';
import { api } from './client';
import type {
  Category,
  City,
  ListingCard,
  ListingDetails,
  ListingSearch,
  Paginated,
  Tag,
  VenueDetails,
} from './types';

export async function getCities() {
  const { data } = await api.get<City[]>('/cities');
  return data;
}

export async function getCategories(point?: LatLng | null, radiusKm?: number) {
  const { data } = await api.get<Category[]>('/categories', {
    params: point ? { ...point, radiusKm } : undefined,
  });
  return data;
}

export async function getTags() {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

export async function searchListings(search: ListingSearch) {
  const { data } = await api.get<Paginated<ListingCard>>('/listings', {
    params: search,
    paramsSerializer: { indexes: null },
  });
  return data;
}

export async function getListing(id: number, point?: LatLng | null) {
  const { data } = await api.get<ListingDetails>(`/listings/${id}`, {
    params: point ?? undefined,
  });
  return data;
}

export async function getNearbyListings(id: number) {
  const { data } = await api.get<ListingCard[]>(`/listings/${id}/nearby`);
  return data;
}

export async function getVenue(slug: string, point?: LatLng | null) {
  const { data } = await api.get<VenueDetails>(`/venues/${slug}`, {
    params: point ?? undefined,
  });
  return data;
}

export async function getVenueListings(slug: string) {
  const { data } = await api.get<ListingCard[]>(`/venues/${slug}/listings`);
  return data;
}
