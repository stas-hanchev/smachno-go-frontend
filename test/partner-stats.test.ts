import type { PartnerListing, PartnerOffer, VenueOrder } from '@/api/types';
import { dayStats, discountPercent, minimumPrice } from '@/lib/partner-stats';

const order = (patch: Partial<VenueOrder>) =>
  ({
    publicId: 'X',
    status: 'paid',
    quantity: 1,
    totalAmount: '89.00',
    listingId: 1,
    ...patch,
  }) as VenueOrder;

const listings = [
  { id: 1, offerId: 10 },
  { id: 2, offerId: 20 },
] as PartnerListing[];
const offers = [
  { id: 10, estWeightKg: 0.8 },
  { id: 20, estWeightKg: 1.5 },
] as PartnerOffer[];

describe('dayStats', () => {
  it('counts sold sets, revenue, waiting orders and saved kilograms', () => {
    const stats = dayStats(
      [
        order({ publicId: 'A', status: 'paid', quantity: 2, totalAmount: '178.00' }),
        order({
          publicId: 'B',
          status: 'picked_up',
          quantity: 1,
          listingId: 2,
          totalAmount: '129.00',
        }),
        order({ publicId: 'C', status: 'no_show', quantity: 1, totalAmount: '89.00' }),
        order({
          publicId: 'D',
          status: 'cancelled_by_customer',
          quantity: 3,
          totalAmount: '267.00',
        }),
        order({ publicId: 'E', status: 'pending_payment', quantity: 1 }),
      ],
      listings,
      offers,
    );
    expect(stats).toEqual({ sold: 4, revenue: 396, waiting: 1, savedKg: 1.5 });
  });

  it('returns zeros for an empty day', () => {
    expect(dayStats([], [], [])).toEqual({ sold: 0, revenue: 0, waiting: 0, savedKg: 0 });
  });
});

describe('price hints', () => {
  it('computes the discount and the minimum allowed price', () => {
    expect(discountPercent(89, 250)).toBe(64);
    expect(discountPercent(250, 250)).toBe(0);
    expect(discountPercent(0, 250)).toBe(0);
    expect(minimumPrice(250, 0.1)).toBe(25);
    expect(minimumPrice(99.99, 0.1)).toBe(10);
  });
});
