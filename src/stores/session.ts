import { create } from 'zustand';
import type { Session, User } from '@/api/types';

interface SessionState {
  accessToken: string | null;
  user: User | null;
  ready: boolean;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clear: () => void;
  markReady: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  accessToken: null,
  user: null,
  ready: false,
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null }),
  markReady: () => set({ ready: true }),
}));
