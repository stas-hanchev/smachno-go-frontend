'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { normalizeError } from '@/api/client';
import { createOrder, type OrderSource } from '@/api/orders';
import { useRequireLogin } from './useRequireLogin';

export function checkoutPaymentKey(publicId: string) {
  return ['checkout-payment', publicId] as const;
}

export function useBookListing(listingId: number, source: OrderSource = 'direct') {
  const router = useRouter();
  const queryClient = useQueryClient();
  const requireLogin = useRequireLogin();
  const attempt = useRef<{ key: string; quantity: number } | null>(null);

  const mutation = useMutation({
    mutationFn: (quantity: number) => {
      if (!attempt.current || attempt.current.quantity !== quantity) {
        attempt.current = { key: crypto.randomUUID(), quantity };
      }
      return createOrder({ listingId, quantity, source }, attempt.current.key);
    },
    onSuccess: ({ order, payment }) => {
      attempt.current = null;
      queryClient.setQueryData(checkoutPaymentKey(order.publicId), payment);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push(`/checkout/${order.publicId}`);
    },
    onError: (error) => {
      if (normalizeError(error).status !== null) attempt.current = null;
    },
  });

  return {
    book: (quantity: number) => {
      if (!requireLogin()) return;
      mutation.mutate(quantity);
    },
    pending: mutation.isPending || mutation.isSuccess,
    error: mutation.error ? normalizeError(mutation.error) : null,
  };
}
