import type { CheckoutParams } from '@/api/types';

export function submitCheckout(payment: CheckoutParams) {
  if (payment.method === 'GET' || !payment.data || !payment.signature) {
    window.location.assign(payment.checkoutUrl);
    return;
  }
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payment.checkoutUrl;
  form.acceptCharset = 'utf-8';
  for (const [name, value] of [
    ['data', payment.data],
    ['signature', payment.signature],
  ] as const) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
