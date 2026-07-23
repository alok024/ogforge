import { createCheckoutOrder } from '@/lib/checkout';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const planId = body.planId as string;
  if (!planId) {
    return Response.json({ error: 'planId required' }, { status: 400 });
  }
  try {
    const result = await createCheckoutOrder(planId);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'checkout failed';
    return Response.json({ error: message }, { status: 400 });
  }
}
