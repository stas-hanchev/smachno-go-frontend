import { distanceMeters, nearestCity } from '@/lib/geo';

const kyiv = { name: 'Київ', centerLat: 50.4501, centerLng: 30.5234 };
const kharkiv = { name: 'Харків', centerLat: 49.9935, centerLng: 36.2304 };

describe('distanceMeters', () => {
  it('returns zero for the same point and roughly 410 km between Kyiv and Kharkiv', () => {
    const a = { lat: kyiv.centerLat, lng: kyiv.centerLng };
    expect(distanceMeters(a, a)).toBe(0);
    const d = distanceMeters(a, { lat: kharkiv.centerLat, lng: kharkiv.centerLng });
    expect(d).toBeGreaterThan(400_000);
    expect(d).toBeLessThan(420_000);
  });
});

describe('nearestCity', () => {
  it('picks the closest city center', () => {
    expect(nearestCity([kharkiv, kyiv], { lat: 50.39, lng: 30.36 })).toBe(kyiv);
    expect(nearestCity([kyiv, kharkiv], { lat: 49.95, lng: 36.0 })).toBe(kharkiv);
  });

  it('returns undefined for an empty list', () => {
    expect(nearestCity([], { lat: 50, lng: 30 })).toBeUndefined();
  });
});
