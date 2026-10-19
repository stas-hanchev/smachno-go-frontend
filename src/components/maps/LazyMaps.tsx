'use client';

import Skeleton from '@mui/material/Skeleton';
import dynamic from 'next/dynamic';

function MapSkeleton() {
  return <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%', minHeight: 220 }} />;
}

export const VenuesMap = dynamic(() => import('./VenuesMap').then((m) => m.VenuesMap), {
  ssr: false,
  loading: MapSkeleton,
});

export const PointPicker = dynamic(() => import('./PointPicker').then((m) => m.PointPicker), {
  ssr: false,
  loading: MapSkeleton,
});

export const VenueLocationMap = dynamic(
  () => import('./VenueLocationMap').then((m) => m.VenueLocationMap),
  { ssr: false, loading: MapSkeleton },
);
