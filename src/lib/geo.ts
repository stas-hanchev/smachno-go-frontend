export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMeters(a: LatLng, b: LatLng) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function nearestCity<T extends { centerLat: number; centerLng: number }>(
  cities: T[],
  point: LatLng,
) {
  let best: T | undefined;
  let bestDistance = Infinity;
  for (const city of cities) {
    const d = distanceMeters(point, { lat: city.centerLat, lng: city.centerLng });
    if (d < bestDistance) {
      best = city;
      bestDistance = d;
    }
  }
  return best;
}
