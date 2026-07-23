import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'OGForge — Dynamic Open Graph images & meta tags API',
  description:
    'Ship rich link previews in one line of HTML. Generate dynamic Open Graph social-preview images and copy-paste meta tags from a single API. No design tools, no headless browser.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
