'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import {
  IconImage,
  IconUpload,
  IconTrash,
  IconMegaphone,
  IconPhone,
  IconClock,
  IconLayers,
  IconHome,
  IconSave,
} from '@/components/Icons';

type Settings = {
  logoUrl: string;
  logoPublicId: string;
  phoneDigits: string;
  phoneDisplay: string;
  email: string;
  instagram: string;
  announcement: string;
  deliveryAreas: string[];
  hoursText: string;
  hiddenProducts: string[];
  heroTitle: string;
  heroSubtitle: string;
};

/** Fallback list shown only until the live menu loads from the API. */
const FALLBACK_PRODUCTS = [
  { id: 'BRW-001', name: 'Brownies' },
  { id: 'BEN-001', name: 'Bento Cakes' },
  { id: 'FON-001', name: 'Fondant Cakes' },
  { id: 'BOM-001', name: 'Bomboloni' },
  { id: 'CUP-001', name: 'Cupcakes' },
  { id: 'DON-001', name: 'Donuts' },
  { id: 'BDY-001', name: 'Birthday Cakes' },
  { id: 'PIZ-001', name: 'Pizza' },
];

/**
 * Website Settings manager — lets the owner change live site details
 * (contact info, announcement banner, delivery areas, hours, menu visibility,
 * home hero text) without editing code. Saved values apply within ~1 minute.
 */
export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [areasText, setAreasText] = useState('');
  const [allProducts, setAllProducts] = useState(FALLBACK_PRODUCTS);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
          setAreasText((data.settings.deliveryAreas || []).join(', '));
        } else {
          setMessage({ type: 'error', text: data.error || 'Could not load settings.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Could not load settings.' });
      }
      // Load the LIVE menu so this list always matches the real website,
      // including any categories added from the Menu Manager.
      try {
        const res = await fetch('/api/admin/menu');
        const data = await res.json();
        if (data.success) {
          const builtIn = (data.builtIn || []).map((p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name,
          }));
          const custom = (data.menu?.custom || []).map((c: { id: string; name: string }) => ({
            id: c.id,
            name: c.name,
          }));
          const all = [...builtIn, ...custom];
          if (all.length) setAllProducts(all);
        }
      } catch {
        /* keep fallback list */
      }
    })();
  }, []);

  if (!settings) {
    return (
      <div className="settings-manager">
        <h2>Website Settings</h2>
        {message ? <div className={`message ${message.type}`}>{message.text}</div> : <p className="muted">Loading settings…</p>}
      </div>
    );
  }

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  function toggleHidden(id: string) {
    if (!settings) return;
    const hidden = settings.hiddenProducts.includes(id)
      ? settings.hiddenProducts.filter((x) => x !== id)
      : [...settings.hiddenProducts, id];
    set('hiddenProducts', hidden);
  }

  /** Upload a new 1:1 logo. Cloudinary squares and resizes it to 512x512. */
  async function uploadLogo(file: File) {
    setLogoBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set('logo', file);
      const res = await fetch('/api/admin/logo', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo updated! It appears across the site within a minute.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload the logo.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload the logo.' });
    }
    setLogoBusy(false);
  }

  /** Remove the custom logo and go back to the built-in default mark. */
  async function removeLogo() {
    if (!confirm('Remove your custom logo?\n\nThe website will go back to the default Desserty House logo. You can upload a new one anytime.')) {
      return;
    }
    setLogoBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/logo', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Logo removed — the default logo is back.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove the logo.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove the logo.' });
    }
    setLogoBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...settings,
        deliveryAreas: areasText.split(',').map((a) => a.trim()).filter(Boolean),
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setAreasText(data.settings.deliveryAreas.join(', '));
        setMessage({ type: 'success', text: 'Settings saved! Changes appear on the website within about a minute.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }
    setSaving(false);
  }

  return (
    <div className="settings-manager">
      <div className="post-manager-header">
        <div>
          <h2>Website Settings</h2>
          <p className="muted">Change live website details — no code or redeploy needed</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <form onSubmit={save} className="post-form settings-form">
        <h3><IconImage size={17} /> Brand logo</h3>
        <p className="muted" style={{ margin: '4px 0 10px' }}>
          Shown in the website header and footer. Use a <b>square (1:1)</b> image — we crop and
          resize it to 512&times;512 automatically. PNG with a transparent background works best.
        </p>
        <div className="logo-manager">
          <div className="logo-preview">
            {logoPreview ? (
              <img src={logoPreview} alt="New logo preview" />
            ) : (
              <Logo logoUrl={settings.logoUrl} size={96} />
            )}
          </div>
          <div className="logo-manager-body">
            <span className="logo-badge">
              {logoPreview ? 'PREVIEW' : settings.logoUrl ? 'CUSTOM LOGO' : 'DEFAULT LOGO'}
            </span>
            <p className="muted">
              {settings.logoUrl
                ? 'Your uploaded logo is live on the website.'
                : 'Using the built-in Desserty House logo. Upload your own to replace it.'}
            </p>
            <div className="repeat-actions">
              <label className="icon-btn" style={{ cursor: logoBusy ? 'wait' : 'pointer' }}>
                <IconUpload size={14} /> {logoBusy ? 'Working…' : settings.logoUrl ? 'Replace logo' : 'Upload logo'}
                <input
                  type="file"
                  accept="image/png,image/webp,image/jpeg,image/svg+xml"
                  disabled={logoBusy}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    if (logoPreview) URL.revokeObjectURL(logoPreview);
                    setLogoPreview(URL.createObjectURL(f));
                    uploadLogo(f);
                  }}
                />
              </label>
              {settings.logoUrl && (
                <button type="button" className="icon-btn danger" disabled={logoBusy} onClick={removeLogo}>
                  <IconTrash size={14} /> Remove logo
                </button>
              )}
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              PNG, WebP, JPG or SVG · up to 4 MB
            </p>
          </div>
        </div>

        <h3><IconMegaphone size={17} /> Announcement banner</h3>
        <label>
          Banner text (shown at the top of every page; leave empty to hide)
          <input
            type="text"
            maxLength={200}
            placeholder="e.g., 🎄 Christmas pre-orders open! Order before Dec 20."
            value={settings.announcement}
            onChange={(e) => set('announcement', e.target.value)}
          />
        </label>

        <h3><IconPhone size={17} /> Contact details</h3>
        <div className="form-row">
          <label>
            WhatsApp number (digits only, with country code)
            <input
              type="text"
              value={settings.phoneDigits}
              onChange={(e) => set('phoneDigits', e.target.value.replace(/\D/g, ''))}
              placeholder="918939411490"
            />
          </label>
          <label>
            Phone shown to customers
            <input
              type="text"
              value={settings.phoneDisplay}
              onChange={(e) => set('phoneDisplay', e.target.value)}
              placeholder="+91 89394 11490"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Email
            <input type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label>
            Instagram URL
            <input type="text" value={settings.instagram} onChange={(e) => set('instagram', e.target.value)} />
          </label>
        </div>

        <h3><IconClock size={17} /> Business hours &amp; delivery</h3>
        <div className="form-row">
          <label>
            Hours (shown on Contact page)
            <input
              type="text"
              value={settings.hoursText}
              onChange={(e) => set('hoursText', e.target.value)}
              placeholder="Mon–Sat 9:00–20:00 · Sun 10:00–18:00"
            />
          </label>
          <label>
            Delivery areas (comma-separated)
            <input
              type="text"
              value={areasText}
              onChange={(e) => setAreasText(e.target.value)}
              placeholder="Chennai, Tambaram, Velachery, …"
            />
          </label>
        </div>

        <h3><IconLayers size={17} /> Menu visibility</h3>
        <p className="muted" style={{ margin: '4px 0 10px' }}>
          Untick a product to temporarily hide it from the website menu (e.g. sold out or on a break).
          It stays hidden until you tick it again.
        </p>
        <div className="product-toggles">
          {allProducts.map((p) => (
            <label key={p.id} className="product-toggle">
              <input
                type="checkbox"
                checked={!settings.hiddenProducts.includes(p.id)}
                onChange={() => toggleHidden(p.id)}
              />
              <span>{p.name} <small>({p.id})</small></span>
            </label>
          ))}
        </div>

        <h3><IconHome size={17} /> Home page hero text</h3>
        <div className="form-row">
          <label>
            Main heading (leave empty for default)
            <input
              type="text"
              maxLength={120}
              value={settings.heroTitle}
              onChange={(e) => set('heroTitle', e.target.value)}
              placeholder="Handmade cakes & brownies in Chennai…"
            />
          </label>
          <label>
            Sub-heading (leave empty for default)
            <input
              type="text"
              maxLength={300}
              value={settings.heroSubtitle}
              onChange={(e) => set('heroSubtitle', e.target.value)}
              placeholder="Fresh brownies, bento cakes…"
            />
          </label>
        </div>

        <div className="post-submit-row">
          <button type="submit" className="btn gold" disabled={saving}>
            <IconSave size={16} /> {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
        <p className="muted post-submit-hint">
          Product names, descriptions, photos and menu items are edited in the{' '}
          <b>Menu &amp; Products</b> tab. Page wording, FAQs, reviews and SEO/AI text are in the{' '}
          <b>Website Content</b> tab. Only the street address, policy pages and prices still live
          in the code.
        </p>
      </form>
    </div>
  );
}
