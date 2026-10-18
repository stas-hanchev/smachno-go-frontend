import { create } from 'zustand';
import type { Session, User } from '@/api/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  ready: boolean;
  setSession: (session: Session) => void;
  clear: () => void;
  markReady: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  ready: false,
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
  markReady: () => set({ ready: true }),
}));
