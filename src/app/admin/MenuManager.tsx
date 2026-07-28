'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ProductIcon,
  IconPlus,
  IconTrash,
  IconPencil,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconSave,
  IconImage,
  IconUpload,
  IconLayers,
} from '@/components/Icons';

type Style = { code: string; title: string; description: string; image: string };
type BuiltIn = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  details: string[];
  gallery: Style[];
};
type Override = {
  name?: string;
  short?: string;
  description?: string;
  details?: string[];
  hidden?: boolean;
  order?: number;
};
type StyleOverride = {
  title?: string;
  description?: string;
  image_url?: string;
  hidden?: boolean;
};
type CustomStyle = {
  code: string;
  title: string;
  description: string;
  image_url: string;
  hidden?: boolean;
};
type CustomProduct = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  details?: string[];
  image_url: string;
  hidden?: boolean;
  order?: number;
};
type MenuData = {
  overrides: Record<string, Override>;
  styleOverrides: Record<string, Record<string, StyleOverride>>;
  extraStyles: Record<string, CustomStyle[]>;
  custom: CustomProduct[];
};

/**
 * Menu Manager — complete master control of the public menu.
 *
 *  Categories: edit name / tagline / description / bullet points, reorder,
 *              hide, add brand-new ones, delete the ones you added.
 *  Styles:     edit the title, description and photo of every item inside a
 *              category, hide individual items, add extra items, and reset any
 *              built-in item back to its original.
 */
export default function MenuManager() {
  const [builtIn, setBuiltIn] = useState<BuiltIn[]>([]);
  const [menu, setMenu] = useState<MenuData>({
    overrides: {},
    styleOverrides: {},
    extraStyles: {},
    custom: [],
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openStyles, setOpenStyles] = useState<string | null>(null);
  const [busyStyle, setBusyStyle] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', short: '', description: '' });
  const [editCustom, setEditCustom] = useState<CustomProduct | null>(null);
  const styleFileInput = useRef<HTMLInputElement>(null);
  const pendingStyleTarget = useRef<{ productId: string; code: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  function notify(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
  }

  async function load() {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success) {
        setBuiltIn(data.builtIn);
        setMenu({
          overrides: data.menu.overrides || {},
          styleOverrides: data.menu.styleOverrides || {},
          extraStyles: data.menu.extraStyles || {},
          custom: data.menu.custom || [],
        });
      } else {
        notify('error', data.error || 'Could not load menu.');
      }
    } catch {
      notify('error', 'Could not load menu.');
    }
  }

  function setOverride(id: string, patch: Override) {
    setMenu((m) => ({ ...m, overrides: { ...m.overrides, [id]: { ...m.overrides[id], ...patch } } }));
  }

  function effective(p: BuiltIn) {
    const o = menu.overrides[p.id] || {};
    return {
      name: o.name ?? p.name,
      short: o.short ?? p.short,
      description: o.description ?? p.description,
      details: o.details ?? p.details,
      hidden: !!o.hidden,
      changed: !!(o.name || o.short || o.description || o.details || o.hidden),
    };
  }

  /** All style items for a category, with overrides applied, for the editor UI. */
  function stylesFor(productId: string, baseGallery: Style[]) {
    const overrides = menu.styleOverrides[productId] || {};
    const base = baseGallery.map((s) => {
      const o = overrides[s.code] || {};
      return {
        code: s.code,
        title: o.title ?? s.title,
        description: o.description ?? s.description,
        image: o.image_url || s.image,
        hidden: !!o.hidden,
        edited: !!(o.title || o.description || o.image_url),
        custom: false,
      };
    });
    const extras = (menu.extraStyles[productId] || []).map((s) => ({
      code: s.code,
      title: s.title,
      description: s.description,
      image: s.image_url,
      hidden: !!s.hidden,
      edited: false,
      custom: true,
    }));
    return [...base, ...extras];
  }

  /* ---------------- category save ---------------- */
  async function saveAll() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: menu.overrides, styleOverrides: menu.styleOverrides }),
      });
      const data = await res.json();
      if (data.success) {
        setMenu({
          overrides: data.menu.overrides || {},
          styleOverrides: data.menu.styleOverrides || {},
          extraStyles: data.menu.extraStyles || {},
          custom: data.menu.custom || [],
        });
        setEditingId(null);
        notify('success', 'Menu saved! Changes appear on the website within about a minute.');
      } else {
        notify('error', data.error || 'Failed to save menu.');
      }
    } catch {
      notify('error', 'Failed to save menu.');
    }
    setSaving(false);
  }

  /* ---------------- reordering ---------------- */
  async function moveCategory(id: string, direction: -1 | 1) {
    const ordered = orderedIds();
    const i = ordered.indexOf(id);
    const j = i + direction;
    if (i === -1 || j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: ordered }),
      });
      const data = await res.json();
      if (data.success) {
        setMenu((m) => ({
          ...m,
          overrides: data.menu.overrides || {},
          custom: data.menu.custom || [],
        }));
      } else {
        notify('error', data.error || 'Failed to reorder.');
      }
    } catch {
      notify('error', 'Failed to reorder.');
    }
  }

  function orderedIds() {
    const all = [
      ...builtIn.map((p) => ({ id: p.id, order: menu.overrides[p.id]?.order })),
      ...menu.custom.map((c) => ({ id: c.id, order: c.order })),
    ];
    return all
      .map((x, i) => ({ ...x, fallback: typeof x.order === 'number' ? x.order : 1000 + i }))
      .sort((a, b) => a.fallback - b.fallback)
      .map((x) => x.id);
  }

  /* ---------------- style actions ---------------- */
  async function patchStyle(productId: string, code: string, patch: Partial<StyleOverride>) {
    setBusyStyle(`${productId}:${code}`);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'style', product_id: productId, code, ...patch }),
      });
      const data = await res.json();
      if (data.success) applyMenu(data.menu);
      else notify('error', data.error || 'Failed to update item.');
    } catch {
      notify('error', 'Failed to update item.');
    }
    setBusyStyle(null);
  }

  async function resetStyle(productId: string, code: string, isCustom: boolean) {
    const label = isCustom ? 'Remove this added item from the menu?' : 'Reset this item back to its original photo and text?';
    if (!confirm(label)) return;
    setBusyStyle(`${productId}:${code}`);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'style', product_id: productId, code }),
      });
      const data = await res.json();
      if (data.success) {
        applyMenu(data.menu);
        notify('success', isCustom ? 'Item removed.' : 'Item reset to default.');
      } else {
        notify('error', data.error || 'Failed.');
      }
    } catch {
      notify('error', 'Failed.');
    }
    setBusyStyle(null);
  }

  function applyMenu(m: Partial<MenuData>) {
    setMenu({
      overrides: m.overrides || {},
      styleOverrides: m.styleOverrides || {},
      extraStyles: m.extraStyles || {},
      custom: m.custom || [],
    });
  }

  /** Trigger the hidden file input to replace a style photo. */
  function pickStyleImage(productId: string, code: string) {
    pendingStyleTarget.current = { productId, code };
    styleFileInput.current?.click();
  }

  async function onStyleImageChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = pendingStyleTarget.current;
    e.target.value = '';
    if (!file || !target) return;
    setBusyStyle(`${target.productId}:${target.code}`);
    try {
      const fd = new FormData();
      fd.set('action', 'style-image');
      fd.set('product_id', target.productId);
      fd.set('code', target.code);
      fd.set('image', file);
      const res = await fetch('/api/admin/menu', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        applyMenu(data.menu);
        notify('success', 'Photo updated. The website refreshes within a minute.');
      } else {
        notify('error', data.error || 'Failed to upload photo.');
      }
    } catch {
      notify('error', 'Failed to upload photo.');
    }
    setBusyStyle(null);
  }

  async function addStyle(productId: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.set('action', 'style');
    fd.set('product_id', productId);
    setBusyStyle(`${productId}:new`);
    try {
      const res = await fetch('/api/admin/menu', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        applyMenu(data.menu);
        form.reset();
        notify('success', 'New item added to this category.');
      } else {
        notify('error', data.error || 'Failed to add item.');
      }
    } catch {
      notify('error', 'Failed to add item.');
    }
    setBusyStyle(null);
  }

  /* ---------------- custom categories ---------------- */
  async function addCustom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      fd.set('action', 'category');
      fd.set('name', newForm.name);
      fd.set('short', newForm.short);
      fd.set('description', newForm.description);
      const res = await fetch('/api/admin/menu', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        applyMenu(data.menu);
        setNewForm({ name: '', short: '', description: '' });
        if (uploadPreview) URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
        form.reset();
        notify(
          'success',
          `"${data.product.name}" added! It appears on the website within a minute at /menu/${data.product.slug}.`
        );
      } else {
        notify('error', data.error || 'Failed to add product.');
      }
    } catch {
      notify('error', 'Failed to add product.');
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
        applyMenu(data.menu);
        setEditCustom(null);
        notify('success', 'Product updated.');
      } else {
        notify('error', data.error || 'Failed to update.');
      }
    } catch {
      notify('error', 'Failed to update.');
    }
  }

  async function toggleCustomHidden(c: CustomProduct) {
    const res = await fetch('/api/admin/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, hidden: !c.hidden }),
    });
    const data = await res.json();
    if (data.success) applyMenu(data.menu);
  }

  async function removeCustom(c: CustomProduct) {
    if (
      !confirm(
        `Permanently remove "${c.name}" from the menu?\n\nIts photos will also be deleted from Cloudinary. This cannot be undone.`
      )
    )
      return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id }),
      });
      const data = await res.json();
      if (data.success) {
        applyMenu(data.menu);
        notify('success', `"${c.name}" removed from the menu.`);
      } else {
        notify('error', data.error || 'Failed to remove.');
      }
    } catch {
      notify('error', 'Failed to remove.');
    }
  }

  const order = orderedIds();
  const sortedBuiltIn = [...builtIn].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  /* ---------------- style editor panel ---------------- */
  function StyleEditor({ productId, gallery }: { productId: string; gallery: Style[] }) {
    const items = stylesFor(productId, gallery);
    const visible = items.filter((s) => !s.hidden).length;
    return (
      <div className="style-editor">
        <div className="style-toolbar">
          <b>
            <IconLayers size={15} /> Items in this category
          </b>
          <span className="badge-soft">
            {visible} shown / {items.length} total
          </span>
        </div>
        <div className="style-grid">
          {items.map((s) => {
            const busy = busyStyle === `${productId}:${s.code}`;
            return (
              <div className={`style-card ${s.hidden ? 'is-hidden' : ''}`} key={s.code}>
                <img src={s.image} alt={s.title} loading="lazy" />
                <span className="style-code">
                  {s.code}
                  {s.custom ? ' · ADDED' : s.edited ? ' · EDITED' : ''}
                </span>
                <input
                  type="text"
                  value={s.title}
                  aria-label={`Title for ${s.code}`}
                  onChange={(e) => {
                    if (s.custom) return;
                    setMenu((m) => ({
                      ...m,
                      styleOverrides: {
                        ...m.styleOverrides,
                        [productId]: {
                          ...(m.styleOverrides[productId] || {}),
                          [s.code]: {
                            ...(m.styleOverrides[productId]?.[s.code] || {}),
                            title: e.target.value,
                          },
                        },
                      },
                    }));
                  }}
                  onBlur={(e) => {
                    if (s.custom) patchStyle(productId, s.code, { title: e.target.value });
                  }}
                />
                <textarea
                  value={s.description}
                  aria-label={`Description for ${s.code}`}
                  onChange={(e) => {
                    if (s.custom) return;
                    setMenu((m) => ({
                      ...m,
                      styleOverrides: {
                        ...m.styleOverrides,
                        [productId]: {
                          ...(m.styleOverrides[productId] || {}),
                          [s.code]: {
                            ...(m.styleOverrides[productId]?.[s.code] || {}),
                            description: e.target.value,
                          },
                        },
                      },
                    }));
                  }}
                  onBlur={(e) => {
                    if (s.custom) patchStyle(productId, s.code, { description: e.target.value });
                  }}
                />
                <div className="repeat-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={busy}
                    onClick={() => pickStyleImage(productId, s.code)}
                    title="Replace this photo"
                  >
                    <IconImage size={13} /> {busy ? '…' : 'Photo'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={busy}
                    onClick={() => patchStyle(productId, s.code, { hidden: !s.hidden })}
                    title={s.hidden ? 'Show on website' : 'Hide from website'}
                  >
                    {s.hidden ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                    {s.hidden ? 'Show' : 'Hide'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    disabled={busy}
                    onClick={() => resetStyle(productId, s.code, s.custom)}
                    title={s.custom ? 'Remove this item' : 'Reset to original'}
                  >
                    <IconTrash size={13} /> {s.custom ? 'Remove' : 'Reset'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="repeat-item"
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            addStyle(productId, e.currentTarget);
          }}
        >
          <div className="repeat-item-head">
            <b>
              <IconPlus size={15} /> Add a new item to this category
            </b>
          </div>
          <div className="form-row">
            <label>
              Item name *
              <input type="text" name="title" required maxLength={100} placeholder="e.g. Biscoff Brownie" />
            </label>
            <label>
              Photo *
              <input type="file" name="image" required accept="image/webp,image/jpeg,image/png" />
            </label>
          </div>
          <label>
            Short description
            <textarea name="description" rows={2} maxLength={600} placeholder="How you would describe it to a customer…" />
          </label>
          <button className="btn small gold" type="submit" disabled={busyStyle === `${productId}:new`}>
            <IconUpload size={14} /> {busyStyle === `${productId}:new` ? 'Uploading…' : 'Add item'}
          </button>
        </form>

        <button
          type="button"
          className="btn small gold"
          style={{ marginTop: 10 }}
          onClick={saveAll}
          disabled={saving}
        >
          <IconSave size={14} /> {saving ? 'Saving…' : 'Save text changes'}
        </button>
      </div>
    );
  }

  return (
    <div className="menu-manager">
      {/* hidden input used for all style photo replacements */}
      <input
        type="file"
        ref={styleFileInput}
        onChange={onStyleImageChosen}
        accept="image/webp,image/jpeg,image/png"
        style={{ display: 'none' }}
      />

      <div className="post-manager-header">
        <div>
          <h2>Menu Manager</h2>
          <p className="muted">
            Full control of the website menu: edit categories and every item inside them, change
            photos, reorder, hide, add or remove.
          </p>
        </div>
        <button className="btn" onClick={load} type="button">
          <IconRefresh size={15} /> Refresh
        </button>
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
        Edit how each category appears, reorder it, hide it, or open{' '}
        <b>Manage items</b> to edit the individual products inside it.
      </p>
      <div className="menu-builtin-grid">
        {sortedBuiltIn.map((p, index) => {
          const eff = effective(p);
          return (
            <div
              key={p.id}
              className={`menu-builtin-card ${eff.hidden ? 'is-hidden' : ''} ${
                openStyles === p.id ? 'is-expanded' : ''
              }`}
            >
              <div className="menu-builtin-head">
                <ProductIcon slug={p.slug} size={18} />
                <b>{eff.name}</b>
                <span className="sku">{p.id}</span>
                {eff.hidden && <span className="draft-badge menu-hidden-badge">HIDDEN</span>}
                {!eff.hidden && eff.changed && <span className="menu-edited-badge">edited</span>}
                <span className="order-controls">
                  <button
                    className="icon-btn"
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCategory(p.id, -1)}
                    aria-label={`Move ${eff.name} up`}
                  >
                    ↑
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    disabled={index === sortedBuiltIn.length - 1}
                    onClick={() => moveCategory(p.id, 1)}
                    aria-label={`Move ${eff.name} down`}
                  >
                    ↓
                  </button>
                </span>
              </div>

              {editingId === p.id ? (
                <div className="post-edit-form">
                  <label>
                    Displayed name
                    <input
                      type="text"
                      value={eff.name}
                      onChange={(e) => setOverride(p.id, { name: e.target.value })}
                    />
                  </label>
                  <label>
                    Tagline (card text)
                    <input
                      type="text"
                      value={eff.short}
                      onChange={(e) => setOverride(p.id, { short: e.target.value })}
                    />
                  </label>
                  <label>
                    Full description (product page)
                    <textarea
                      rows={3}
                      value={eff.description}
                      onChange={(e) => setOverride(p.id, { description: e.target.value })}
                    />
                  </label>
                  <label>
                    Bullet points (one per line)
                    <textarea
                      rows={3}
                      value={eff.details.join('\n')}
                      onChange={(e) =>
                        setOverride(p.id, {
                          details: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <div className="post-actions">
                    <button className="btn small" onClick={saveAll} disabled={saving} type="button">
                      <IconSave size={14} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      className="btn small outline"
                      type="button"
                      onClick={() => {
                        setMenu((m) => {
                          const o = { ...m.overrides };
                          delete o[p.id];
                          return { ...m, overrides: o };
                        });
                        setEditingId(null);
                      }}
                    >
                      Reset to default
                    </button>
                    <button className="btn small outline" type="button" onClick={() => setEditingId(null)}>
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="muted menu-short">{eff.short}</p>
                  <div className="post-actions">
                    <button className="btn small outline" type="button" onClick={() => setEditingId(p.id)}>
                      <IconPencil size={14} /> Edit
                    </button>
                    <button
                      className="btn small outline"
                      type="button"
                      onClick={() => setOpenStyles(openStyles === p.id ? null : p.id)}
                    >
                      <IconLayers size={14} />{' '}
                      {openStyles === p.id ? 'Close items' : `Manage items (${stylesFor(p.id, p.gallery).length})`}
                    </button>
                    <button
                      className={`btn small ${eff.hidden ? '' : 'outline'}`}
                      type="button"
                      onClick={() => setOverride(p.id, { hidden: !eff.hidden })}
                    >
                      {eff.hidden ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                      {eff.hidden ? 'Hidden — click to show' : 'Hide from website'}
                    </button>
                  </div>
                </>
              )}

              {openStyles === p.id && <StyleEditor productId={p.id} gallery={p.gallery} />}
            </div>
          );
        })}
      </div>
      <div className="post-submit-row" style={{ marginTop: 12 }}>
        <button className="btn gold" onClick={saveAll} disabled={saving} type="button">
          <IconSave size={16} /> {saving ? 'Saving…' : 'Save all category changes'}
        </button>
      </div>

      {/* ============ Custom categories ============ */}
      <h3 className="menu-section-title" style={{ marginTop: 34 }}>
        Your added categories ({menu.custom.length})
      </h3>
      {menu.custom.length > 0 ? (
        <div className="menu-builtin-grid">
          {menu.custom.map((c) => (
            <div
              key={c.id}
              className={`menu-builtin-card ${c.hidden ? 'is-hidden' : ''} ${
                openStyles === c.id ? 'is-expanded' : ''
              }`}
            >
              <div className="menu-builtin-head">
                <b>{c.name}</b>
                <span className="sku">{c.id}</span>
                {c.hidden && <span className="draft-badge menu-hidden-badge">HIDDEN</span>}
              </div>
              <img
                src={c.image_url}
                alt={c.name}
                loading="lazy"
                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 9, margin: '6px 0' }}
              />
              {editCustom?.id === c.id ? (
                <form className="post-edit-form" onSubmit={saveCustomEdit}>
                  <label>
                    Name
                    <input
                      type="text"
                      value={editCustom.name}
                      onChange={(e) => setEditCustom({ ...editCustom, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Tagline
                    <input
                      type="text"
                      value={editCustom.short}
                      onChange={(e) => setEditCustom({ ...editCustom, short: e.target.value })}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      rows={3}
                      value={editCustom.description}
                      onChange={(e) => setEditCustom({ ...editCustom, description: e.target.value })}
                    />
                  </label>
                  <div className="post-actions">
                    <button className="btn small gold" type="submit">
                      <IconSave size={14} /> Save
                    </button>
                    <button className="btn small outline" type="button" onClick={() => setEditCustom(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="muted menu-short">{c.short}</p>
                  <div className="post-actions">
                    <button className="btn small outline" type="button" onClick={() => setEditCustom(c)}>
                      <IconPencil size={14} /> Edit
                    </button>
                    <button
                      className="btn small outline"
                      type="button"
                      onClick={() => setOpenStyles(openStyles === c.id ? null : c.id)}
                    >
                      <IconLayers size={14} /> {openStyles === c.id ? 'Close items' : 'Manage items'}
                    </button>
                    <button className="btn small outline" type="button" onClick={() => toggleCustomHidden(c)}>
                      {c.hidden ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                      {c.hidden ? 'Show' : 'Hide'}
                    </button>
                    <button className="btn small danger" type="button" onClick={() => removeCustom(c)}>
                      <IconTrash size={14} /> Remove
                    </button>
                  </div>
                </>
              )}
              {openStyles === c.id && (
                <StyleEditor
                  productId={c.id}
                  gallery={[
                    { code: c.id, title: c.name, description: c.short, image: c.image_url },
                  ]}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">
          You have not added any categories yet. Use the form below to create one — it goes live on
          the website within a minute.
        </p>
      )}

      {/* ============ Add a category ============ */}
      <h3 className="menu-section-title" style={{ marginTop: 34 }}>
        Add a new category
      </h3>
      <form className="post-form" onSubmit={addCustom}>
        <label>
          Category name *
          <input
            type="text"
            required
            maxLength={80}
            placeholder="e.g. Chocolate Truffle Jars"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
          />
        </label>
        <label>
          Tagline * (the one-line text on the menu card)
          <input
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Rich layered truffle jars, made fresh to order."
            value={newForm.short}
            onChange={(e) => setNewForm({ ...newForm, short: e.target.value })}
          />
        </label>
        <label>
          Full description
          <textarea
            rows={3}
            placeholder="Describe the product, options, sizes and how to order…"
            value={newForm.description}
            onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
          />
        </label>
        <label className="file-input-label">
          Category photo *
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
              {uploadPreview ? (
                <img src={uploadPreview} alt="New product" />
              ) : (
                <div className="post-preview-noimg">Photo preview appears here</div>
              )}
              <div>
                <span className="sku">NEW CATEGORY</span>
                <h3>{newForm.name || 'Category name…'}</h3>
                <p>{newForm.short || 'Tagline…'}</p>
              </div>
            </div>
          </div>
        )}
        <div className="post-submit-row">
          <button type="submit" className="btn gold" disabled={adding}>
            <IconUpload size={16} /> {adding ? 'Uploading…' : 'Add category to menu'}
          </button>
        </div>
        <p className="muted post-submit-hint">
          New categories get their own page (e.g. /menu/chocolate-truffle-jars), appear on the home
          page, menu, sitemap and order form automatically, and can be hidden or removed anytime.
        </p>
      </form>
    </div>
  );
}
