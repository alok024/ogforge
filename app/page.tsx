'use client';

import { useEffect, useMemo, useState } from 'react';
import { listThemes, listTemplates, ogImageUrl } from '@/lib/meta';
import { listPlans } from '@/lib/checkout';
import { purchase } from '@/lib/purchaseClient';

const themes = listThemes();
const templates = listTemplates();
const plans = listPlans();

const PLAN_FEATURES: Record<string, string[]> = {
  hobby: ['50 images / month', 'All 3 themes', 'Meta-tag generator', 'Community support'],
  pro_month: ['5,000 images / month', 'Custom titles & subtitles', 'No watermark', 'Email support'],
  scale_month: ['50,000 images / month', 'Priority rendering', 'Team API keys', 'Priority support'],
  lifetime: ['Pay once, own forever', '50k images / month', 'All future themes', 'Founder support'],
};

function fmtPrice(amount: number, currency: string): string {
  if (amount === 0) return 'Free';
  return (currency === 'USD' ? '$' : '') + (amount / 100).toFixed(amount % 100 === 0 ? 0 : 2);
}

export default function Home() {
  const [title, setTitle] = useState('Ship rich link previews in one line');
  const [description, setDescription] = useState('Dynamic Open Graph images and meta tags from a single API.');
  const [url, setUrl] = useState('https://ogforge.dev');
  const [image, setImage] = useState('');
  const [theme, setTheme] = useState('sky');

  const [tags, setTags] = useState('');
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const previewSrc = useMemo(
    () => ogImageUrl({ title, description, theme }),
    [title, description, theme],
  );

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, url, image, theme }),
      });
      const data = await res.json();
      setTags(data.tags);
    }, 250);
    return () => clearTimeout(t);
  }, [title, description, url, image, theme]);

  async function copyTags() {
    try {
      await navigator.clipboard.writeText(tags);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function buy(planId: string) {
    setBuying(planId);
    setNotice(null);
    try {
      const result = await purchase(planId);
      if (result.ok) {
        setUnlocked(planId);
        setNotice(
          result.testMode
            ? 'Test mode - no real charge. Plan unlocked locally.'
            : 'Payment verified. Plan unlocked.',
        );
      } else if (result.error && result.error !== 'dismissed') {
        setNotice('Checkout error: ' + result.error);
      }
    } finally {
      setBuying(null);
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="brand">
          <span className="dot" />
          OGForge
        </div>
        <div className="row" style={{ flex: 'initial', gap: 10 }}>
          <a className="btn ghost" href="#generator">Try it</a>
          <a className="btn secondary" href="/dashboard">Dashboard</a>
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">Open Graph as a service</span>
          <h1>
            Ship rich link previews in <span className="gradient-text">one line of HTML</span>
          </h1>
          <p className="lead">
            OGForge renders dynamic social-preview images and copy-paste meta tags from a single API.
            No design tools, no headless browser, no per-page screenshots.
          </p>
          <div className="row" style={{ justifyContent: 'center', flex: 'initial' }}>
            <a className="btn lg" href="#generator">Generate a preview</a>
            <a className="btn secondary lg" href="#pricing">See pricing</a>
          </div>

          <div className="card" style={{ marginTop: 40, padding: 16, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
            <img
              src={ogImageUrl({ title: 'Ship rich link previews', description: 'Dynamic OG images, generated on the fly', theme: 'sky' })}
              alt="Live Open Graph preview"
              width={1200}
              height={630}
              style={{ width: '100%', height: 'auto', borderRadius: 10, display: 'block' }}
            />
            <p className="muted" style={{ margin: '12px 4px 0', fontSize: '0.85rem' }}>
              Live render from <code>/api/og</code> — no cache, no external service.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="center">Themes &amp; templates</h2>
          <p className="lead center">Pick a theme, drop in your text, done. Every image is 1200×630 and CDN-cacheable.</p>
          <div className="grid cols-3">
            {templates.map((tpl) => (
              <div className="card" key={tpl.id} style={{ padding: 14 }}>
                <img
                  src={ogImageUrl({ title: tpl.title, description: tpl.subtitle, theme: tpl.theme })}
                  alt={tpl.label}
                  width={1200}
                  height={630}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }}
                />
                <div className="row" style={{ marginTop: 12, alignItems: 'center', flex: 'initial' }}>
                  <strong style={{ flex: 1 }}>{tpl.label}</strong>
                  <span className="badge">{tpl.theme}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="generator">
          <h2 className="center">Meta-tag generator</h2>
          <p className="lead center">Fill the form and copy the tags into your <code>&lt;head&gt;</code>.</p>
          <div className="grid cols-2">
            <div className="card">
              <div className="field">
                <label htmlFor="f-title">Title</label>
                <input id="f-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="f-desc">Description</label>
                <textarea id="f-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="f-url">Canonical URL</label>
                  <input id="f-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="f-theme">Theme</label>
                  <select id="f-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-image">Override image URL (optional)</label>
                <input
                  id="f-image"
                  type="url"
                  placeholder="Leave blank to auto-generate"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <label>Live preview</label>
              <img
                key={previewSrc}
                src={previewSrc}
                alt="Generated preview"
                width={1200}
                height={630}
                style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block', marginBottom: 16 }}
              />
              <div className="row" style={{ alignItems: 'center', flex: 'initial', marginBottom: 8 }}>
                <label style={{ flex: 1, margin: 0 }}>Meta tags</label>
                <button className="btn secondary" onClick={copyTags} style={{ flex: 'initial' }}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre>{tags || 'Generating…'}</pre>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <h2 className="center">Pricing</h2>
          <p className="lead center">Start free. Upgrade when your previews go viral.</p>
          {notice && (
            <p className="center">
              <span className="badge ok">{notice}</span>
            </p>
          )}
          <div className="grid cols-3">
            {plans.filter((p) => p.id !== 'lifetime').map((plan) => (
              <div className="card" key={plan.id}>
                <div className="row" style={{ alignItems: 'center', flex: 'initial' }}>
                  <strong style={{ flex: 1, fontSize: '1.1rem' }}>{plan.label.split(' - ')[0]}</strong>
                  {plan.kind === 'sub' && <span className="badge">subscription</span>}
                  {plan.kind === 'free' && <span className="badge ok">free</span>}
                </div>
                <div className="price" style={{ margin: '12px 0 4px' }}>
                  <span className="amt">{fmtPrice(plan.amount, plan.currency)}</span>
                  {plan.kind === 'sub' && <span className="muted">/mo</span>}
                </div>
                <p className="muted" style={{ marginTop: 0 }}>{plan.label.split(' - ')[1] || 'Get started'}</p>
                <ul className="pill-list">
                  {(PLAN_FEATURES[plan.id] || []).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {plan.kind === 'free' ? (
                  <a className="btn secondary" href="/dashboard" style={{ width: '100%' }}>Use free plan</a>
                ) : (
                  <button
                    className="btn"
                    style={{ width: '100%' }}
                    disabled={buying === plan.id}
                    onClick={() => buy(plan.id)}
                  >
                    {buying === plan.id ? <span className="spinner" /> : unlocked === plan.id ? 'Unlocked' : `Buy ${plan.label.split(' - ')[0]}`}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="card center" style={{ marginTop: 20 }}>
            <div className="row" style={{ alignItems: 'center', justifyContent: 'center', flex: 'initial' }}>
              <strong style={{ fontSize: '1.1rem' }}>Lifetime deal</strong>
              <span className="badge warn">one-time</span>
              <span className="amt" style={{ fontSize: '1.6rem' }}>$49</span>
            </div>
            <p className="muted">Pay once, keep 50k images/month forever.</p>
            <button
              className="btn"
              disabled={buying === 'lifetime'}
              onClick={() => buy('lifetime')}
            >
              {buying === 'lifetime' ? <span className="spinner" /> : unlocked === 'lifetime' ? 'Unlocked' : 'Buy lifetime'}
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="center">Two ways to use it</h2>
          <div className="grid cols-2">
            <div className="card">
              <strong>1. Drop in an image URL</strong>
              <pre>{`<meta property="og:image"
  content="https://ogforge.dev/api/og?title=Hello&theme=sky" />`}</pre>
            </div>
            <div className="card">
              <strong>2. Generate the full block</strong>
              <pre>{`curl -X POST https://ogforge.dev/api/meta \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","description":"World","theme":"sky"}'`}</pre>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          OGForge · Dynamic Open Graph images &amp; meta tags · Built on next/og — no external render service
        </div>
      </footer>
    </>
  );
}
