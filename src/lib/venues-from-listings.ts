import type { ListingCard } from '@/api/types';

export interface VenueSummary {
  id: number;
  slug: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  ratingAvg: string | null;
  distanceM: number | null;
  listingsCount: number;
  minPrice: string;
  maxDiscount: number;
  categoryName: string;
}

export function venuesFromListings(listings: ListingCard[]): VenueSummary[] {
  const byVenue = new Map<number, VenueSummary>();
  for (const listing of listings) {
    const existing = byVenue.get(listing.venue.id);
    if (!existing) {
      byVenue.set(listing.venue.id, {
        id: listing.venue.id,
        slug: listing.venue.slug,
        name: listing.venue.name,
        address: listing.venue.address,
        lat: listing.venue.lat,
        lng: listing.venue.lng,
        ratingAvg: listing.venue.ratingAvg,
        distanceM: listing.distanceM,
        listingsCount: 1,
        minPrice: listing.price,
        maxDiscount: listing.discountPercent,
        categoryName: listing.offer.category.name,
      });
      continue;
    }
    existing.listingsCount += 1;
    if (Number(listing.price) < Number(existing.minPrice)) existing.minPrice = listing.price;
    existing.maxDiscount = Math.max(existing.maxDiscount, listing.discountPercent);
  }
  return [...byVenue.values()].sort(
    (a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity),
  );
}
