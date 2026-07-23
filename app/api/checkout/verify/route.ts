import { confirmPurchase } from '@/lib/checkout';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { order_id, payment_id, signature } = body;
  const ok = confirmPurchase(order_id, payment_id, signature);
  return Response.json({ ok });
}
