# OGForge

Dynamic Open Graph image and meta-tag generator — a developer API plus a small dashboard.

Drop one `<meta property="og:image" content="https://.../api/og?title=...&theme=sky" />`
into your `<head>` and every link to your site gets a rich, on-brand social preview.
Images are rendered with Next.js's built-in [`next/og`](https://nextjs.org/docs/app/api-reference/functions/image-response)
`ImageResponse` — pure server compute, **no external render service and no API key**.

## What it does

- `GET /api/og?title=...&subtitle=...&theme=sky|indigo|dark` → a 1200×630 PNG social card.
- `POST /api/meta` with `{ title, description, url, image, theme }` → a copy-paste block of
  Open Graph + Twitter meta tags and the generated `og_image_url`.
- Landing page (`/`): live preview, a themes/templates gallery, an interactive meta-tag
  generator with a Copy button, and pricing with working Buy buttons.
- Dashboard (`/dashboard`): demo API key, a monthly usage meter, current plan, and an
  Upgrade button wired to checkout.

## Run locally (zero API keys)

```bash
npm install
npm run build     # production build, must exit 0
npm run smoke     # asserts meta + checkout flow, prints SMOKE-OK
```

There is no `next dev` step needed to prove it works — the build compiles the OG route and
the smoke test exercises `buildMetaTags` and the full mock checkout order. To click through
the UI, run `npm run start` and open http://localhost:3000.

Because no Razorpay keys are set, checkout runs in **mock mode**: the order route returns a
`mock_payment` (payment id + signature) so the browser completes `order → verify → unlock`
locally with no charge and no Razorpay modal. The UI shows a visible
"Test mode - no real charge" note.

## Pricing & Razorpay flow

| Plan   | Price        | What you get            |
| ------ | ------------ | ----------------------- |
| Hobby  | Free         | 50 images / month       |
| Pro    | $9 / month   | 5,000 images / month    |
| Scale  | $19 / month  | 50,000 images / month   |
| Lifetime | $49 once   | 50k images / month, forever |

Checkout (identical across the product line):

1. Client `POST /api/checkout/order { planId }` → `createCheckoutOrder` looks up the plan and
   calls `createOrder(amount, currency, { planId })`.
2. **Mock mode (no keys):** the response includes `mock_payment`; the client verifies it
   directly against `/api/checkout/verify` and unlocks — no real modal, no charge.
3. **Live mode (keys set):** the client loads `checkout.razorpay.com/v1/checkout.js`, opens the
   Razorpay modal, and takes `payment_id` + `razorpay_signature` from the handler.
4. Either way the client `POST /api/checkout/verify { order_id, payment_id, signature }`;
   `verifyPaymentSignature` (HMAC-SHA256) confirms it and the UI unlocks.

Both branches live in `lib/purchaseClient.ts`; only the mock branch runs without keys.

## Real cost-per-use math

- Each `/api/og` render is pure server CPU + a small PNG over CDN egress — roughly
  **~$0.0002 per image** (no AI model, no headless browser, no per-image third-party fee).
- Selling at **$9–$19 / month**, a Pro user rendering all 5,000 images costs about
  **$1.00** in compute/egress → **gross margin ~99%**.
- Optional future upsell: AI-generated background templates via Replicate FLUX-schnell would
  add **~$0.003 per image**. Not part of this MVP — the current renders need no AI key.

## Going live (real keys)

The OG image API needs **no keys** in production. Only real payments do. Set these env vars
(names in `.env.example`):

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — live/test Razorpay credentials. Without them
  the whole checkout stays in mock/test mode.
- `RAZORPAY_WEBHOOK_SECRET` — optional, only if you wire the webhook route for server-side
  confirmation.

No Groq, Replicate, or other model provider is used in this MVP.

## Project layout

- `app/page.tsx` — landing + interactive generator (client component).
- `app/dashboard/page.tsx` — API key, usage meter, plan, upgrade.
- `app/api/og/route.tsx` — `ImageResponse` renderer (`runtime = "nodejs"`).
- `app/api/meta/route.ts` — meta-tag builder endpoint.
- `app/api/checkout/{order,verify}/route.ts` — shared checkout.
- `lib/meta.ts` — pure meta-tag + theme/template helpers.
- `lib/checkout.ts` — plans + mock-friendly checkout.
- `lib/razorpay.ts` — Razorpay helper with keyless mock mode.
- `lib/purchaseClient.ts` — browser checkout (mock + real branches).
- `scripts/smoke.ts` — build-free assertions.
