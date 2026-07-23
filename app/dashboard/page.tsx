'use client';

import { useState } from 'react';
import { purchase } from '@/lib/purchaseClient';

const DEMO_API_KEY = 'ogf_demo_live_8fJ2xQ9pR4nK';
const USED = 1240;
const QUOTA = 5000;

export default function Dashboard() {
  const [plan, setPlan] = useState('Pro — $9/mo');
  const [buying, setBuying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pct = Math.min(100, Math.round((USED / QUOTA) * 100));

  async function upgrade() {
    setBuying(true);
    setNotice(null);
    try {
      const result = await purchase('scale_month');
      if (result.ok) {
        setPlan('Scale — $19/mo');
        setNotice(
          result.testMode
            ? 'Test mode - no real charge. Upgraded to Scale locally.'
            : 'Payment verified. Upgraded to Scale.',
        );
      } else if (result.error && result.error !== 'dismissed') {
        setNotice('Checkout error: ' + result.error);
      }
    } finally {
      setBuying(false);
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(DEMO_API_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="brand">
          <span className="dot" />
          OGForge
        </div>
        <a className="btn secondary" href="/" style={{ flex: 'initial' }}>Home</a>
      </nav>

      <main className="container section">
        <h1>Dashboard</h1>
        <p className="lead">Your API key, usage, and plan.</p>

        {notice && (
          <p>
            <span className="badge ok">{notice}</span>
          </p>
        )}

        <div className="grid cols-2">
          <div className="card">
            <label>API key</label>
            <div className="row" style={{ alignItems: 'center', flex: 'initial' }}>
              <code style={{ flex: 1, fontSize: '0.95rem', wordBreak: 'break-all' }}>{DEMO_API_KEY}</code>
              <button className="btn secondary" onClick={copyKey} style={{ flex: 'initial' }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
              Send as <code>Authorization: Bearer ogf_...</code> on every request.
            </p>
          </div>

          <div className="card">
            <label>Current plan</label>
            <div className="row" style={{ alignItems: 'center', flex: 'initial', marginBottom: 12 }}>
              <strong style={{ flex: 1, fontSize: '1.2rem' }}>{plan}</strong>
              <span className="badge ok">active</span>
            </div>
            <button className="btn" onClick={upgrade} disabled={buying}>
              {buying ? <span className="spinner" /> : 'Upgrade to Scale'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="row" style={{ alignItems: 'center', flex: 'initial' }}>
            <label style={{ flex: 1, margin: 0 }}>Usage this month</label>
            <span className="muted">{USED.toLocaleString()} / {QUOTA.toLocaleString()} calls</span>
          </div>
          <div
            style={{
              marginTop: 12,
              height: 12,
              borderRadius: 999,
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: pct + '%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              }}
            />
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0, marginTop: 10 }}>
            {pct}% of your monthly image quota used. Resets on the 1st.
          </p>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <label>Quick start</label>
          <pre>{`<meta property="og:image"
  content="https://ogforge.dev/api/og?title=${encodeURIComponent('Your title')}&theme=sky" />`}</pre>
        </div>
      </main>

      <footer className="footer">
        <div className="container">OGForge · Dashboard</div>
      </footer>
    </>
  );
}
