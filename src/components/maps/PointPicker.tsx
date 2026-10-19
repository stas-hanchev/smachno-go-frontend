'use client';

import { useEffect, useRef } from 'react';
import { Marker, type MapRef } from 'react-map-gl/mapbox';
import type { LatLng } from '@/lib/geo';
import { BaseMap, KYIV_CENTER } from './BaseMap';
import { MapPin } from './MapPin';

export function PointPicker({
  point,
  onPick,
  height = 320,
}: {
  point: LatLng | null;
  onPick: (point: LatLng) => void;
  height?: number;
}) {
  const map = useRef<MapRef>(null);

  useEffect(() => {
    if (point) map.current?.easeTo({ center: [point.lng, point.lat] });
  }, [point]);

  const start = point ?? KYIV_CENTER;

  return (
    <div style={{ height, borderRadius: 20, overflow: 'hidden' }}>
      <BaseMap
        ref={map}
        initialViewState={{ latitude: start.lat, longitude: start.lng, zoom: 13 }}
        cursor="crosshair"
        onClick={(event) => onPick({ lat: event.lngLat.lat, lng: event.lngLat.lng })}
      >
        {point && (
          <Marker latitude={point.lat} longitude={point.lng} anchor="bottom">
            <MapPin />
          </Marker>
        )}
      </BaseMap>
    </div>
  );
}
