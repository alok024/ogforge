import {
  createOrder,
  verifyPaymentSignature,
  mockSignature,
  RAZORPAY_MOCK,
} from './razorpay';

export type PlanKind = 'free' | 'sub' | 'one-time';

export interface Plan {
  amount: number;
  currency: string;
  label: string;
  kind: PlanKind;
}

export const PLANS: Record<string, Plan> = {
  hobby: { amount: 0, currency: 'USD', label: 'Free - 50 imgs/mo', kind: 'free' },
  pro_month: { amount: 900, currency: 'USD', label: '$9/mo - 5k images', kind: 'sub' },
  scale_month: { amount: 1900, currency: 'USD', label: '$19/mo - 50k images', kind: 'sub' },
  lifetime: { amount: 4900, currency: 'USD', label: '$49 lifetime', kind: 'one-time' },
};

export interface PlanListing extends Plan {
  id: string;
}

export function listPlans(): PlanListing[] {
  return Object.entries(PLANS).map(([id, plan]) => ({ id, ...plan }));
}

export interface CheckoutOrder {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  mock: boolean;
  planId: string;
  label: string;
  mock_payment?: { payment_id: string; signature: string };
}

export async function createCheckoutOrder(planId: string): Promise<CheckoutOrder> {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const order = await createOrder(plan.amount, plan.currency, { planId });
  const base: CheckoutOrder = {
    order_id: order.order_id,
    amount: order.amount,
    currency: order.currency,
    key: order.key,
    mock: order.mock,
    planId,
    label: plan.label,
  };

  if (order.mock) {
    const payment_id = 'pay_mock_' + order.order_id.slice(-8);
    const signature = mockSignature(order.order_id, payment_id);
    base.mock_payment = { payment_id, signature };
  }

  return base;
}

export function confirmPurchase(
  order_id: string,
  payment_id: string,
  signature: string,
): boolean {
  return verifyPaymentSignature(order_id, payment_id, signature);
}

export { RAZORPAY_MOCK };
