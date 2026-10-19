'use client';

import { Marker } from 'react-map-gl/mapbox';
import type { LatLng } from '@/lib/geo';
import { BaseMap } from './BaseMap';
import { MapPin } from './MapPin';

export function VenueLocationMap({ point }: { point: LatLng }) {
  return (
    <BaseMap
      initialViewState={{ latitude: point.lat, longitude: point.lng, zoom: 15 }}
      cooperativeGestures
    >
      <Marker latitude={point.lat} longitude={point.lng} anchor="bottom">
        <MapPin />
      </Marker>
    </BaseMap>
  );
}
