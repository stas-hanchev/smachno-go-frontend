import { create } from 'zustand';

export type NotifySeverity = 'success' | 'info' | 'warning' | 'error';

interface NotifyMessage {
  id: number;
  text: string;
  severity: NotifySeverity;
}

interface NotifyState {
  current: NotifyMessage | null;
  queue: NotifyMessage[];
  push: (text: string, severity?: NotifySeverity) => void;
  next: () => void;
}

let nextId = 1;

export const useNotifyStore = create<NotifyState>()((set) => ({
  current: null,
  queue: [],
  push: (text, severity = 'info') =>
    set((state) => {
      const message = { id: nextId++, text, severity };
      return state.current ? { queue: [...state.queue, message] } : { current: message };
    }),
  next: () =>
    set((state) => {
      const [head = null, ...rest] = state.queue;
      return { current: head, queue: rest };
    }),
}));

export const notify = {
  success: (text: string) => useNotifyStore.getState().push(text, 'success'),
  info: (text: string) => useNotifyStore.getState().push(text, 'info'),
  error: (text: string) => useNotifyStore.getState().push(text, 'error'),
};
