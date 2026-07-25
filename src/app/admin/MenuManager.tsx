'use client';

import { useState, useEffect } from 'react';

type BuiltIn = { id: string; slug: string; name: string; short: string; description: string };
type Override = { name?: string; short?: string; description?: string; hidden?: boolean };
type CustomProduct = {
  id: string; slug: string; name: string; short: string; description: string;
  image_url: string; hidden?: boolean;
};

/**
 * Menu Manager — full master control of the public menu:
 *  - Edit name/tagline/description of every built-in category (Brownies, Pizza…)
 *  - Hide/show any category
 *  - Add brand-new products with a photo (live on the site in ~1 minute)
 *  - Edit, hide or permanently remove custom products
 */
export default function MenuManager() {
  const [builtIn, setBuiltIn] = useState<BuiltIn[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [custom, setCustom] = useState<CustomProduct[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', short: '', description: '' });
  const [editCustom, setEditCustom] = useState<CustomProduct | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success) {
        setBuiltIn(data.builtIn);
        setOverrides(data.menu.overrides || {});
        setCustom(data.menu.custom || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Could not load menu.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not load menu.' });
    }
  }

  function setOverride(id: string, patch: Override) {
    setOverrides((o) => ({ ...o, [id]: { ...o[id], ...patch } }));
  }

  function effective(p: BuiltIn) {
    const o = overrides[p.id] || {};
    return {
      name: o.name ?? p.name,
      short: o.short ?? p.short,
      description: o.description ?? p.description,
      hidden: !!o.hidden,
      changed: !!(o.name || o.short || o.description || o.hidden),
    };
  }

  async function saveOverrides() {
    setSavingOverrides(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides }),
      });
      const data = await res.json();
      if (data.success) {
        setOverrides(data.menu.overrides || {});
        setEditingId(null);
        setMessage({ type: 'success', text: 'Menu saved! Changes appear on the website within about a minute.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save menu.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save menu.' });
    }
    setSavingOverrides(false);
  }

  async function addCustom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      fd.set('name', newForm.name);
      fd.set('short', newForm.short);
      fd.set('description', newForm.description);
      const res = await fetch('/api/admin/menu', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setCustom(data.menu.custom || []);
        setNewForm({ name: '', short: '', description: '' });
        if (uploadPreview) URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
        form.reset();
        setMessage({ type: 'success', text: `"${data.product.name}" added! It appears on the website within a minute at /menu/${data.product.slug}.` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to add product.' });
    }
    setAdding(false);
  }

  async function saveCustomEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCustom) return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustom),
      });
      const data = await res.json();
      if (data.success) {
        setCustom(data.menu.custom || []);
        setEditCustom(null);
        setMessage({ type: 'success', text: 'Product updated.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update.' });
    }
  }

  async function toggleCustomHidden(c: CustomProduct) {
    const res = await fetch('/api/admin/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, hidden: !c.hidden }),
    });
    const data = await res.json();
    if (data.success) setCustom(data.menu.custom || []);
  }

  async function removeCustom(c: CustomProduct) {
    if (!confirm(`Permanently remove "${c.name}" from the menu?\n\nIts photo will also be deleted from Cloudinary. This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCustom(data.menu.custom || []);
        setMessage({ type: 'success', text: `"${c.name}" removed from the menu.` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove.' });
    }
  }

  return (
    <div className="menu-manager">
      <div className="post-manager-header">
        <div>
          <h2>Menu Manager</h2>
          <p className="muted">Full control of the website menu: edit, hide, add or remove products</p>
        </div>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* ============ Built-in categories ============ */}
      <h3 className="menu-section-title">Categories ({builtIn.length})</h3>
      <p className="muted" style={{ margin: '0 0 12px' }}>
        Edit how each category appears on the website, or hide it temporarily. Style photo galleries
        stay managed in Cloudinary.
      </p>
      <div className="menu-builtin-grid">
        {builtIn.map((p) => {
          const eff = effective(p);
          return (
            <div key={p.id} className={`menu-builtin-card ${eff.hidden ? 'is-hidden' : ''}`}>
              <div className="menu-builtin-head">
                <b>{eff.name}</b>
                <span className="sku">{p.id}</span>
                {eff.hidden && <span className="draft-badge menu-hidden-badge">HIDDEN</span>}
                {!eff.hidden && eff.changed && <span className="menu-edited-badge">edited</span>}
              </div>
              {editingId === p.id ? (
                <div className="post-edit-form">
                  <label>Displayed name
                    <input type="text" value={eff.name} onChange={(e) => setOverride(p.id, { name: e.target.value })} />
                  </label>
                  <label>Tagline (card text)
                    <input type="text" value={eff.short} onChange={(e) => setOverride(p.id, { short: e.target.value })} />
                  </label>
                  <label>Full description (product page)
                    <textarea rows={3} value={eff.description} onChange={(e) => setOverride(p.id, { description: e.target.value })} />
                  </label>
                  <div className="post-actions">
                    <button className="btn small" onClick={saveOverrides} disabled={savingOverrides}>
                      {savingOverrides ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn small outline" onClick={() => { setOverrides((o) => { const c = { ...o }; delete c[p.id]; return c; }); setEditingId(null); }}>
                      Reset to default
                    </button>
                    <button className="btn small outline" onClick={() => setEditingId(null)}>Close</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="muted menu-short">{eff.short}</p>
                  <div className="post-actions">
                    <button className="btn small outline" onClick={() => setEditingId(p.id)}>Edit</button>
                    <button
                      className={`btn small ${eff.hidden ? '' : 'outline'}`}
                      onClick={() => { setOverride(p.id, { hidden: !eff.hidden }); }}
                    >
                      {eff.hidden ? 'Hidden — click to show' : 'Hide from website'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="post-submit-row" style={{ marginTop: 12 }}>
        <button className="btn gold" onClick={saveOverrides} disabled={savingOverrides}>
          {savingOverrides ? 'Saving…' : 'Save all category changes'}
        </button>
      </div>

      {/* ============ Custom products ============ */}
      <h3 className="menu-section-title" style={{ marginTop: 34 }}>
        Your added products ({custom.length})
      </h3>
      {custom.length > 0 && (
        <div className="posts-grid">
          {custom.map((c) => (
            <div key={c.id} className={`post-card ${c.hidden ? 'unpublished' : ''}`}>
              <div className="post-image">
                <img src={c.image_url} alt={c.name} />
                <span className="post-kind">{c.id}</span>
                {c.hidden && <span className="draft-badge">HIDDEN — not on website</span>}
              </div>
              <div className="post-content">
                {editCustom?.id === c.id ? (
                  <form onSubmit={saveCustomEdit} className="post-edit-form">
                    <input type="text" value={editCustom.name} onChange={(e) => setEditCustom({ ...editCustom, name: e.target.value })} required />
                    <input type="text" value={editCustom.short} onChange={(e) => setEditCustom({ ...editCustom, short: e.target.value })} required />
                    <textarea rows={3} value={editCustom.description} onChange={(e) => setEditCustom({ ...editCustom, description: e.target.value })} />
                    <div className="post-actions">
                      <button type="submit" className="btn small">Save</button>
                      <button type="button" className="btn small outline" onClick={() => setEditCustom(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h4>{c.name}</h4>
                    <p>{c.short}</p>
                    <span className="post-code">/menu/{c.slug}</span>
                    <div className="post-actions">
                      <button className="btn small outline" onClick={() => setEditCustom(c)}>Edit</button>
                      <button className="btn small outline" onClick={() => toggleCustomHidden(c)}>
                        {c.hidden ? 'Show' : 'Hide'}
                      </button>
                      <button className="btn small danger" onClick={() => removeCustom(c)}>Remove</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ Add new product ============ */}
      <h3 className="menu-section-title" style={{ marginTop: 30 }}>➕ Add a new product</h3>
      <form onSubmit={addCustom} className="post-form">
        <div className="form-row">
          <label>
            Product name *
            <input
              type="text"
              required
              placeholder="e.g., Chocolate Truffle Jar"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            />
          </label>
          <label>
            Tagline (shown on the menu card) *
            <input
              type="text"
              required
              placeholder="e.g., Layered dessert jars, perfect for gifting."
              value={newForm.short}
              onChange={(e) => setNewForm({ ...newForm, short: e.target.value })}
            />
          </label>
        </div>
        <label>
          Full description (product page)
          <textarea
            rows={3}
            placeholder="Describe the product, options, sizes and how to order…"
            value={newForm.description}
            onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
          />
        </label>
        <label className="file-input-label">
          Product photo *
          <span className="file-hint">WebP, JPG or PNG; maximum 8 MB</span>
          <input
            type="file"
            name="image"
            required
            accept="image/webp,image/jpeg,image/png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (uploadPreview) URL.revokeObjectURL(uploadPreview);
              setUploadPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </label>
        {(uploadPreview || newForm.name) && (
          <div className="post-preview">
            <p className="post-preview-label">Preview — how it will appear on the menu:</p>
            <div className="showcase-card post-preview-card">
              {uploadPreview ? <img src={uploadPreview} alt="New product" /> : <div className="post-preview-noimg">Photo preview appears here</div>}
              <div>
                <span className="sku">NEW PRODUCT</span>
                <h3>{newForm.name || 'Product name…'}</h3>
                <p>{newForm.short || 'Tagline…'}</p>
              </div>
            </div>
          </div>
        )}
        <div className="post-submit-row">
          <button type="submit" className="btn gold" disabled={adding}>
            {adding ? 'Uploading…' : 'Add product to menu'}
          </button>
        </div>
        <p className="muted post-submit-hint">
          New products get their own page (e.g. /menu/chocolate-truffle-jar), appear on the home
          page, menu and order form automatically, and can be hidden or removed anytime.
        </p>
      </form>
    </div>
  );
}
