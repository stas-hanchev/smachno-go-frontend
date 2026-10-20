import type { OrderStatus, PartnerListing, PartnerOffer, VenueOrder } from '@/api/types';

const SOLD_STATUSES: OrderStatus[] = ['paid', 'picked_up', 'no_show'];

export interface DayStats {
  sold: number;
  revenue: number;
  waiting: number;
  savedKg: number;
}

export function dayStats(
  orders: VenueOrder[],
  listings: PartnerListing[],
  offers: PartnerOffer[],
): DayStats {
  const offerByListing = new Map(listings.map((l) => [l.id, l.offerId]));
  const weightByOffer = new Map(offers.map((o) => [o.id, o.estWeightKg]));
  let sold = 0;
  let revenue = 0;
  let waiting = 0;
  let savedKg = 0;
  for (const order of orders) {
    if (!SOLD_STATUSES.includes(order.status)) continue;
    sold += order.quantity;
    revenue += Number(order.totalAmount);
    if (order.status === 'paid') waiting += 1;
    if (order.status === 'picked_up') {
      const offerId = offerByListing.get(order.listingId);
      savedKg += (offerId ? (weightByOffer.get(offerId) ?? 0) : 0) * order.quantity;
    }
  }
  return {
    sold,
    revenue: Math.round(revenue * 100) / 100,
    waiting,
    savedKg: Math.round(savedKg * 10) / 10,
  };
}

export function discountPercent(price: number, originalPrice: number) {
  if (!originalPrice || price >= originalPrice || price <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

export function minimumPrice(originalPrice: number, minRatio: number) {
  return Math.ceil(originalPrice * minRatio * 100) / 100;
}
