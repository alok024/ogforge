
export interface MetaInput {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  theme?: string;
}

export interface ThemeMeta {
  id: string;
  label: string;
  swatch: string;
}

export interface TemplateMeta {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  theme: string;
}

const THEMES: ThemeMeta[] = [
  { id: 'sky', label: 'Sky', swatch: '#0ea5e9' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'dark', label: 'Midnight', swatch: '#0b1220' },
];

const DEFAULT_THEME = 'sky';

export function listThemes(): ThemeMeta[] {
  return THEMES;
}

export function isTheme(theme: string | undefined): boolean {
  return !!theme && THEMES.some((t) => t.id === theme);
}

export function listTemplates(): TemplateMeta[] {
  return [
    {
      id: 'launch',
      label: 'Product launch',
      title: 'Introducing Beam 2.0',
      subtitle: 'Faster builds, real-time preview, zero config',
      theme: 'sky',
    },
    {
      id: 'blog',
      label: 'Blog post',
      title: 'How we cut our p99 latency by 60%',
      subtitle: 'Engineering · 8 min read',
      theme: 'indigo',
    },
    {
      id: 'changelog',
      label: 'Changelog',
      title: 'What shipped in v3.4',
      subtitle: 'Dark mode, API keys, team seats',
      theme: 'dark',
    },
  ];
}

export function ogImageUrl(input: MetaInput): string {
  const theme = isTheme(input.theme) ? (input.theme as string) : DEFAULT_THEME;
  const params = new URLSearchParams();
  params.set('title', input.title || 'Your title here');
  if (input.description) params.set('subtitle', input.description);
  params.set('theme', theme);
  return '/api/og?' + params.toString();
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function resolveBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  return (base && base.trim() ? base.trim() : 'https://ogforge.example').replace(/\/+$/, '');
}

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//.test(value)) return value;
  return resolveBaseUrl() + (value.startsWith('/') ? value : '/' + value);
}

export function buildMetaTags(input: MetaInput): { tags: string; og_image_url: string } {
  const title = input.title || 'Your title here';
  const description = input.description || 'A short, punchy description of the page.';
  const url = input.url || resolveBaseUrl();
  const generated = ogImageUrl(input);
  const image = input.image && /^https?:\/\//.test(input.image) ? input.image : generated;
  const absoluteImage = toAbsoluteUrl(image);

  const lines = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(absoluteImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(absoluteImage)}" />`,
  ];

  return { tags: lines.join('\n'), og_image_url: generated };
}
