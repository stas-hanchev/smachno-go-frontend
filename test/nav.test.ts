import { isActivePath, safeNextPath } from '@/lib/nav';
import { venuesFromListings } from '@/lib/venues-from-listings';
import type { ListingCard } from '@/api/types';

describe('safeNextPath', () => {
  it('allows only local paths', () => {
    expect(safeNextPath('/orders?x=1')).toBe('/orders?x=1');
    expect(safeNextPath('//evil.com')).toBe('/');
    expect(safeNextPath('https://evil.com')).toBe('/');
    expect(safeNextPath('/\\evil.com')).toBe('/');
    expect(safeNextPath(null, '/profile')).toBe('/profile');
  });
});

describe('isActivePath', () => {
  it('matches nested routes but treats home exactly', () => {
    expect(isActivePath('/orders/abc', '/orders')).toBe(true);
    expect(isActivePath('/ordersx', '/orders')).toBe(false);
    expect(isActivePath('/search', '/')).toBe(false);
  });
});

describe('venuesFromListings', () => {
  const card = (id: number, venueId: number, price: string, discount: number, distanceM: number) =>
    ({
      id,
      price,
      discountPercent: discount,
      distanceM,
      offer: { category: { name: 'Випічка' } },
      venue: {
        id: venueId,
        slug: `v${venueId}`,
        name: `V${venueId}`,
        address: '',
        lat: 50,
        lng: 30,
        ratingAvg: null,
      },
    }) as unknown as ListingCard;

  it('groups listings by venue with counts, min price and max discount', () => {
    const venues = venuesFromListings([
      card(1, 1, '90.00', 40, 800),
      card(2, 1, '70.00', 55, 800),
      card(3, 2, '50.00', 30, 200),
    ]);
    expect(venues.map((v) => v.id)).toEqual([2, 1]);
    expect(venues[1]).toMatchObject({ listingsCount: 2, minPrice: '70.00', maxDiscount: 55 });
  });
});
