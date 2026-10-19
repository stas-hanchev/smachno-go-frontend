import axios from 'axios';
import { publicEnv } from '@/lib/env';
import type { LatLng } from '@/lib/geo';

const GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

export interface AddressSuggestion {
  id: string;
  label: string;
  point: LatLng;
}

interface GeocodingResponse {
  features: {
    id: string;
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; name: string; place_formatted?: string };
  }[];
}

export async function searchAddresses(query: string, near: LatLng | null, signal?: AbortSignal) {
  const { data } = await axios.get<GeocodingResponse>(GEOCODING_URL, {
    signal,
    params: {
      q: query,
      access_token: publicEnv.mapboxToken,
      country: 'ua',
      language: 'uk',
      autocomplete: true,
      limit: 6,
      types: 'address,street,neighborhood,locality,place',
      ...(near ? { proximity: `${near.lng},${near.lat}` } : {}),
    },
  });
  return data.features.map<AddressSuggestion>((feature) => ({
    id: feature.id,
    label:
      feature.properties.full_address ??
      [feature.properties.name, feature.properties.place_formatted].filter(Boolean).join(', '),
    point: { lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] },
  }));
}
