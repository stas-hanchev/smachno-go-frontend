'use client';

import { useQuery } from '@tanstack/react-query';
import { getVenueProfile } from '@/api/partner';
import { venueProfileKey } from '@/components/partner/VenueSections';

export function useVenueProfile(venueId: number) {
  return useQuery({ queryKey: venueProfileKey(venueId), queryFn: () => getVenueProfile(venueId) });
}
