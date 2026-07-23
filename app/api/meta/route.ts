import { buildMetaTags } from '@/lib/meta';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { tags, og_image_url } = buildMetaTags({
    title: body.title,
    description: body.description,
    url: body.url,
    image: body.image,
    theme: body.theme,
  });
  return Response.json({ tags, og_image_url });
}
