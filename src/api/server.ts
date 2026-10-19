import { serverApiUrl } from '@/lib/env';
import type { ListingCard, ListingDetails, VenueDetails } from './types';

async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${serverApiUrl}/api/v1${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchVenue(slug: string) {
  return fetchPublic<VenueDetails>(`/venues/${encodeURIComponent(slug)}`);
}

export function fetchVenueListings(slug: string) {
  return fetchPublic<ListingCard[]>(`/venues/${encodeURIComponent(slug)}/listings`);
}

export function fetchListing(id: number) {
  return fetchPublic<ListingDetails>(`/listings/${id}`);
}
