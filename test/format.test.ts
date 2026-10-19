import {
  formatCountdown,
  formatDistance,
  formatPickupWindow,
  formatPrice,
  kyivWeekday,
} from '@/lib/format';
import { plural } from '@/lib/plural';

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

describe('formatCountdown', () => {
  it('formats minutes and seconds and never goes negative', () => {
    expect(formatCountdown(600_000)).toBe('10:00');
    expect(formatCountdown(61_500)).toBe('01:02');
    expect(formatCountdown(-5)).toBe('00:00');
  });
});

describe('plural', () => {
  it('follows Ukrainian plural rules', () => {
    const word = (n: number) => plural(n, 'набір', 'набори', 'наборів');
    expect(word(1)).toBe('набір');
    expect(word(3)).toBe('набори');
    expect(word(5)).toBe('наборів');
    expect(word(11)).toBe('наборів');
    expect(word(22)).toBe('набори');
    expect(word(101)).toBe('набір');
  });
});

describe('kyivWeekday', () => {
  it('returns 1 for Monday and 7 for Sunday in Kyiv time', () => {
    expect(kyivWeekday(new Date('2026-10-19T09:00:00Z'))).toBe(1);
    expect(kyivWeekday(new Date('2026-10-18T22:30:00Z'))).toBe(1);
    expect(kyivWeekday(new Date('2026-10-18T12:00:00Z'))).toBe(7);
  });
});
