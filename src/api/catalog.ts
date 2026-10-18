import { api } from './client';
import type { City, ListingCard, ListingSearch, Paginated } from './types';

export async function getCities() {
  const { data } = await api.get<City[]>('/cities');
  return data;
}

export async function searchListings(search: ListingSearch) {
  const { data } = await api.get<Paginated<ListingCard>>('/listings', {
    params: search,
    paramsSerializer: { indexes: null },
  });
  return data;
}
