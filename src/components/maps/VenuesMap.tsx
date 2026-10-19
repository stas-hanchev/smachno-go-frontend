'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Marker, Popup, type MapRef } from 'react-map-gl/mapbox';
import { ua } from '@/i18n/ua';
import { formatPrice } from '@/lib/format';
import type { LatLng } from '@/lib/geo';
import type { VenueSummary } from '@/lib/venues-from-listings';
import { BaseMap, KYIV_CENTER } from './BaseMap';

const MarkerPill = styled('button', { name: 'SgVenuesMap', slot: 'MarkerPill' })<{
  $active: boolean;
}>(({ theme, $active }) => ({
  padding: '6px 10px',
  borderRadius: 9999,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 13,
  lineHeight: '16px',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  color: $active ? theme.palette.secondary.contrastText : theme.palette.common.white,
  backgroundColor: $active ? theme.palette.secondary.main : theme.palette.primary.main,
  border: `2px solid ${theme.palette.common.white}`,
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  transform: $active ? 'scale(1.1)' : 'none',
  transition: 'transform 150ms',
}));

const Me = styled('div', { name: 'SgVenuesMap', slot: 'Me' })(({ theme }) => ({
  width: 16,
  height: 16,
  borderRadius: 9999,
  backgroundColor: '#1A73E8',
  border: `3px solid ${theme.palette.common.white}`,
  boxShadow: '0 0 0 6px rgba(26, 115, 232, 0.2)',
}));

export function VenuesMap({
  venues,
  center,
  activeId,
  onSelect,
}: {
  venues: VenueSummary[];
  center: LatLng | null;
  activeId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const map = useRef<MapRef>(null);
  const active = venues.find((v) => v.id === activeId) ?? null;
  const start = center ?? KYIV_CENTER;

  useEffect(() => {
    const points = [
      ...venues.map((v) => ({ lat: v.lat, lng: v.lng })),
      ...(center ? [center] : []),
    ];
    if (!map.current || points.length < 2) return;
    const lngs = points.map((p) => p.lng);
    const lats = points.map((p) => p.lat);
    map.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 64, maxZoom: 15, duration: 0 },
    );
  }, [venues, center]);

  return (
    <BaseMap
      ref={map}
      initialViewState={{ latitude: start.lat, longitude: start.lng, zoom: 13 }}
      onClick={() => onSelect(null)}
    >
      {center && (
        <Marker latitude={center.lat} longitude={center.lng}>
          <Me />
        </Marker>
      )}
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          latitude={venue.lat}
          longitude={venue.lng}
          anchor="bottom"
          style={{ zIndex: venue.id === activeId ? 2 : 1 }}
          onClick={(event) => {
            event.originalEvent.stopPropagation();
            onSelect(venue.id);
          }}
        >
          <MarkerPill type="button" $active={venue.id === activeId} aria-label={venue.name}>
            −{venue.maxDiscount}% · {venue.listingsCount}
          </MarkerPill>
        </Marker>
      ))}
      {active && (
        <Popup
          latitude={active.lat}
          longitude={active.lng}
          anchor="bottom"
          offset={40}
          closeButton={false}
          onClose={() => onSelect(null)}
          maxWidth="260px"
        >
          <div style={{ padding: 4 }}>
            <Typography variant="h6" component="p">
              {active.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {active.address}
            </Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              {ua.map.sets(active.listingsCount)} · {ua.map.from(formatPrice(active.minPrice))}
            </Typography>
            <Button
              component={Link}
              href={`/venues/${active.slug}`}
              variant="contained"
              size="small"
              fullWidth
            >
              {ua.map.openVenue}
            </Button>
          </div>
        </Popup>
      )}
    </BaseMap>
  );
}
