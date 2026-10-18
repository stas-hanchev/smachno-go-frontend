import { formatDistance, formatPickupWindow, formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('drops zero cents and keeps others', () => {
    expect(formatPrice('120.00')).toBe('120 ₴');
    expect(formatPrice('99.50')).toBe('99,50 ₴');
  });
});

describe('formatDistance', () => {
  it('uses meters below 1 km and kilometers above', () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(420)).toBe('420 м');
    expect(formatDistance(2350)).toBe('2,4 км');
  });
});

describe('formatPickupWindow', () => {
  const now = new Date('2026-10-17T09:00:00Z');

  it('labels today and tomorrow in Kyiv time', () => {
    expect(formatPickupWindow('2026-10-17T17:00:00Z', '2026-10-17T18:00:00Z', now)).toBe(
      'сьогодні 20:00–21:00',
    );
    expect(formatPickupWindow('2026-10-18T06:00:00Z', '2026-10-18T07:00:00Z', now)).toBe(
      'завтра 09:00–10:00',
    );
  });

  it('uses the date for later days', () => {
    expect(formatPickupWindow('2026-10-20T17:00:00Z', '2026-10-20T18:00:00Z', now)).toBe(
      '20.10 20:00–21:00',
    );
  });
});
