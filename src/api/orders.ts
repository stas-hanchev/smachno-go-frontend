import { api } from './client';
import type { CheckoutParams, CreateOrderResult, Order, OrderDetails, Voucher } from './types';

export type OrderScope = 'active' | 'history';
export type OrderSource = 'search' | 'map' | 'recommendation' | 'favorite' | 'direct';

export async function createOrder(
  input: { listingId: number; quantity: number; source?: OrderSource },
  idempotencyKey: string,
) {
  const { data } = await api.post<CreateOrderResult>('/orders', input, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}

export async function listOrders(scope: OrderScope) {
  const { data } = await api.get<Order[]>('/orders', { params: { status: scope } });
  return data;
}

export async function getOrder(publicId: string) {
  const { data } = await api.get<OrderDetails>(`/orders/${publicId}`);
  return data;
}

export async function getVoucher(publicId: string) {
  const { data } = await api.get<Voucher>(`/orders/${publicId}/voucher`);
  return data;
}

export async function retryPayment(publicId: string) {
  const { data } = await api.post<{ payment: CheckoutParams }>(`/orders/${publicId}/pay`);
  return data.payment;
}

export async function cancelOrder(publicId: string, reason?: string) {
  const { data } = await api.post<Order>(`/orders/${publicId}/cancel`, { reason });
  return data;
}

export async function confirmFakePayment(checkoutUrl: string, result: 'success' | 'failure') {
  const { data } = await api.post<{ outcome: string; orderPublicId: string }>(
    checkoutUrl,
    { result },
    { baseURL: '' },
  );
  return data;
}
