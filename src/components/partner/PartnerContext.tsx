'use client';

import { createContext, useContext } from 'react';
import type { PartnerVenue } from '@/api/types';

export interface PartnerContextValue {
  venue: PartnerVenue;
  venues: PartnerVenue[];
  isOwner: boolean;
}

export const PartnerContext = createContext<PartnerContextValue | null>(null);

export function usePartnerVenue(): PartnerContextValue {
  const value = useContext(PartnerContext);
  if (!value) throw new Error('usePartnerVenue must be used inside PartnerShell');
  return value;
}
