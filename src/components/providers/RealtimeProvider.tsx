'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import type { AppNotification, ListingUpdate, OrderStatus } from '@/api/types';
import { ua } from '@/i18n/ua';
import { publicEnv } from '@/lib/env';
import { patchListing } from '@/lib/listing-cache';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';

const useSocketStore = create<{ socket: Socket | null }>()(() => ({ socket: null }));

export function useSocket() {
  return useSocketStore((s) => s.socket);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((s) => s.accessToken);
  const ready = useSessionStore((s) => s.ready);

  useEffect(() => {
    if (!ready) return;
    const instance = io(publicEnv.apiOrigin, {
      auth: accessToken ? { token: accessToken } : {},
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    instance.on('listing:updated', (update: ListingUpdate) => {
      queryClient
        .getQueryCache()
        .getAll()
        .forEach((query) => {
          const data = query.state.data;
          if (data === undefined) return;
          const patched = patchListing(data, update);
          if (patched !== data) queryClient.setQueryData(query.queryKey, patched);
        });
    });

    instance.on(
      'order:status',
      ({ publicId, status }: { publicId: string; status: OrderStatus }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
        void queryClient.invalidateQueries({ queryKey: ['order', publicId] });
        if (status !== 'pending_payment') {
          notify.info(ua.orders.statusChanged(ua.orders.status[status] ?? status));
        }
      },
    );

    instance.on('notification:new', (notification: AppNotification) => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (!notification.type.startsWith('order_')) notify.info(notification.title);
    });

    useSocketStore.setState({ socket: instance });
    return () => {
      instance.removeAllListeners();
      instance.disconnect();
      useSocketStore.setState({ socket: null });
    };
  }, [ready, accessToken, queryClient]);

  return <>{children}</>;
}

export function useListingSubscription(listingIds: number[]) {
  const socket = useSocket();
  const key = [...new Set(listingIds)].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!socket || !key) return;
    const ids = key.split(',').map(Number);
    const subscribe = () => socket.emit('listing:subscribe', { listingIds: ids.slice(0, 100) });
    subscribe();
    socket.on('connect', subscribe);
    return () => {
      socket.off('connect', subscribe);
      if (socket.connected) socket.emit('listing:unsubscribe', { listingIds: ids.slice(0, 100) });
    };
  }, [socket, key]);
}
