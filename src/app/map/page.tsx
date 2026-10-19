'use client';

import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { searchListings } from '@/api/catalog';
import { errorMessage } from '@/api/client';
import { LocationChip } from '@/components/layout/LocationChip';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { VenuesMap } from '@/components/maps/LazyMaps';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { VenueSummaryCard } from '@/components/venue/VenueSummaryCard';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { mapsEnabled } from '@/lib/env';
import { venuesFromListings } from '@/lib/venues-from-listings';
import { RADIUS_OPTIONS_KM, useLocationStore } from '@/stores/location';

const Layout = styled('div', { name: 'SgMap', slot: 'Layout' })<{ $withMap: boolean }>(
  ({ theme, $withMap }) => ({
    display: 'grid',
    gap: 24,
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('md')]: { gridTemplateColumns: $withMap ? '380px 1fr' : '1fr' },
  }),
);

const List = styled('div', { name: 'SgMap', slot: 'List' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  order: 2,
  [theme.breakpoints.up('md')]: { order: 1, maxHeight: 640, overflowY: 'auto', paddingRight: 4 },
}));

const MapBox = styled('div', { name: 'SgMap', slot: 'MapBox' })(({ theme }) => ({
  order: 1,
  height: 360,
  borderRadius: 24,
  overflow: 'hidden',
  backgroundColor: '#DEF2EE',
  [theme.breakpoints.up('md')]: { order: 2, height: 640 },
}));

export default function MapPage() {
  const { point, radiusKm, ready } = useSearchArea();
  const [activeId, setActiveId] = useState<number | null>(null);

  const listings = useQuery({
    queryKey: ['listings', 'map', { point, radiusKm }],
    queryFn: () => searchListings({ ...point, radiusKm, sort: 'distance', limit: 50 }),
    enabled: ready,
  });

  const venues = useMemo(() => venuesFromListings(listings.data?.data ?? []), [listings.data]);

  return (
    <>
      <PageMain>
        <PageContainer>
          <SectionHeading
            level="h1"
            title={ua.map.title}
            subtitle={ua.map.subtitle}
            action={
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <LocationChip variant="button" />
                <TextField
                  select
                  size="small"
                  label={ua.catalog.radius}
                  value={radiusKm}
                  onChange={(e) => useLocationStore.getState().setRadius(Number(e.target.value))}
                  sx={{ minWidth: 110 }}
                >
                  {RADIUS_OPTIONS_KM.map((km) => (
                    <MenuItem key={km} value={km}>
                      {ua.common.km(km)}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            }
          />
          {!mapsEnabled && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>{ua.map.unavailableTitle}.</strong> {ua.map.unavailableText}
            </Alert>
          )}
          {listings.isError && <Alert severity="error">{errorMessage(listings.error)}</Alert>}
          <Layout $withMap={mapsEnabled}>
            <List>
              {!ready || listings.isPending ? (
                Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: '20px' }} />
                ))
              ) : venues.length === 0 ? (
                <EmptyState icon={<MapOutlinedIcon />} title={ua.map.empty} />
              ) : (
                venues.map((venue) => (
                  <VenueSummaryCard
                    key={venue.id}
                    venue={venue}
                    active={venue.id === activeId}
                    onHover={mapsEnabled ? setActiveId : undefined}
                  />
                ))
              )}
            </List>
            {mapsEnabled && (
              <MapBox>
                {ready && (
                  <VenuesMap
                    venues={venues}
                    center={point}
                    activeId={activeId}
                    onSelect={setActiveId}
                  />
                )}
              </MapBox>
            )}
          </Layout>
        </PageContainer>
      </PageMain>
    </>
  );
}
