import { patchListing } from '@/lib/listing-cache';

const listing = (id: number, quantityLeft = 5) => ({
  id,
  quantityLeft,
  quantityTotal: 10,
  status: 'on_sale',
  pickupStart: '2026-10-19T16:00:00Z',
});

const update = { listingId: 2, quantityLeft: 0, quantityTotal: 10, status: 'sold_out' };

describe('patchListing', () => {
  it('updates the matching listing in arrays, pages and paginated data', () => {
    const infinite = {
      pages: [{ data: [listing(1), listing(2)], meta: { total: 2 } }],
      pageParams: [1],
    };
    const patched = patchListing(infinite, update) as typeof infinite;
    expect(patched.pages[0]!.data[1]).toMatchObject({ quantityLeft: 0, status: 'sold_out' });
    expect(patched.pages[0]!.data[0]).toBe(infinite.pages[0]!.data[0]);
  });

  it('updates listing details and keeps unrelated data by reference', () => {
    expect(patchListing(listing(2), update)).toMatchObject({ quantityLeft: 0 });
    const other = [listing(1)];
    expect(patchListing(other, update)).toBe(other);
    const venue = { id: 2, name: 'Venue' };
    expect(patchListing(venue, update)).toBe(venue);
  });
});
