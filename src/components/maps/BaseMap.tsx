'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import type { ComponentProps, Ref } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import { publicEnv } from '@/lib/env';

export const KYIV_CENTER = { lat: 50.4501, lng: 30.5234 };

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

type BaseMapProps = Omit<ComponentProps<typeof Map>, 'mapboxAccessToken' | 'mapStyle' | 'ref'> & {
  ref?: Ref<MapRef>;
  showControls?: boolean;
};

export function BaseMap({ showControls = true, children, style, ...props }: BaseMapProps) {
  return (
    <Map
      mapboxAccessToken={publicEnv.mapboxToken}
      mapStyle={MAP_STYLE}
      language="uk"
      style={{ width: '100%', height: '100%', ...style }}
      {...props}
    >
      {showControls && <NavigationControl position="top-right" showCompass={false} />}
      {children}
    </Map>
  );
}
