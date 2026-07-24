import { buildMetaTags } from '../lib/meta';
import { createCheckoutOrder } from '../lib/checkout';

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error('ASSERT FAILED: ' + msg);
    process.exit(1);
  }
}

async function main() {
  const meta = buildMetaTags({
    title: 'Hello',
    description: 'd',
    url: 'https://x.com',
    theme: 'sky',
  });
  assert(meta.tags.includes('og:title'), 'meta tags include og:title');
  assert(meta.tags.includes('twitter:card'), 'meta tags include twitter:card');
  assert(meta.og_image_url.includes('/api/og'), 'og_image_url points at /api/og');

  const ogImage = meta.tags.match(/<meta property="og:image" content="([^"]+)"/);
  assert(!!ogImage, 'meta tags include an og:image entry');
  assert(!!ogImage && ogImage[1].startsWith('https://'), 'og:image content is an absolute https URL');

  const o = await createCheckoutOrder('pro_month');
  assert(o.order_id.startsWith('order_mock_'), 'order id is a mock order');
  assert(!!o.mock_payment, 'mock_payment is present in mock mode');
  assert(!!o.mock_payment && o.mock_payment.signature.length > 0, 'mock signature present');

  console.log('SMOKE-OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
