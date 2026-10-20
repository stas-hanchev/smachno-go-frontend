import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PartnerState {
  venueId: number | null;
  soundEnabled: boolean;
  setVenueId: (venueId: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set) => ({
      venueId: null,
      soundEnabled: true,
      setVenueId: (venueId) => set({ venueId }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    { name: 'sg-partner', storage: createJSONStorage(() => localStorage) },
  ),
);
