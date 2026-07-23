import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

interface ThemeStyle {
  bg: string;
  title: string;
  subtitle: string;
  brand: string;
  accent: string;
}

// next/og supports a subset of CSS; keep gradients + colors simple.
const THEMES: Record<string, ThemeStyle> = {
  sky: {
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    title: '#ffffff',
    subtitle: 'rgba(255,255,255,0.85)',
    brand: 'rgba(255,255,255,0.92)',
    accent: '#e0f2fe',
  },
  indigo: {
    bg: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
    title: '#ffffff',
    subtitle: 'rgba(255,255,255,0.85)',
    brand: 'rgba(255,255,255,0.92)',
    accent: '#ede9fe',
  },
  dark: {
    bg: 'linear-gradient(135deg, #0b1220 0%, #1e293b 100%)',
    title: '#f8fafc',
    subtitle: 'rgba(226,232,240,0.75)',
    brand: 'rgba(226,232,240,0.9)',
    accent: '#38bdf8',
  },
};

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = clamp(searchParams.get('title') || 'Your title here', 120);
  const subtitleRaw = searchParams.get('subtitle') || '';
  const subtitle = subtitleRaw ? clamp(subtitleRaw, 160) : '';
  const themeId = searchParams.get('theme') || 'sky';
  const theme = THEMES[themeId] || THEMES.sky;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '1200px',
          height: '630px',
          padding: '72px',
          background: theme.bg,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 30,
            fontWeight: 700,
            color: theme.brand,
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 24,
              height: 24,
              borderRadius: 8,
              marginRight: 14,
              background: theme.accent,
            }}
          />
          OGForge
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              color: theme.title,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: 'flex',
                marginTop: 28,
                fontSize: 34,
                fontWeight: 400,
                color: theme.subtitle,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 26,
            fontWeight: 500,
            color: theme.brand,
          }}
        >
          ogforge.dev · dynamic link previews
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
