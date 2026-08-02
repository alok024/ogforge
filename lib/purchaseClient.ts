'use client';

export interface PurchaseResult {
  ok: boolean;
  testMode: boolean;
  planId: string;
  error?: string;
}

interface OrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  mock: boolean;
  planId: string;
  label: string;
  mock_payment?: { payment_id: string; signature: string };
  error?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(s);
  });
}

async function verify(
  order_id: string,
  payment_id: string,
  signature: string,
): Promise<boolean> {
  const res = await fetch('/api/checkout/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id, payment_id, signature }),
  });
  const data = await res.json();
  return !!data.ok;
}

export async function purchase(planId: string): Promise<PurchaseResult> {
  const orderRes = await fetch('/api/checkout/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });
  const order: OrderResponse = await orderRes.json();
  if (order.error) return { ok: false, testMode: false, planId, error: order.error };

  if (order.mock_payment) {
    const ok = await verify(
      order.order_id,
      order.mock_payment.payment_id,
      order.mock_payment.signature,
    );
    return { ok, testMode: true, planId };
  }

  await loadRazorpay();
  return new Promise<PurchaseResult>((resolve) => {
    const rzp = new window.Razorpay!({
      key: order.key,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'OGForge',
      description: order.label,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const ok = await verify(
          order.order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
        resolve({ ok, testMode: false, planId });
      },
      modal: {
        ondismiss: () =>
          resolve({ ok: false, testMode: false, planId, error: 'dismissed' }),
      },
    });
    rzp.open();
  });
}
