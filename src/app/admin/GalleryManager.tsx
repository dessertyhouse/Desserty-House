'use client';

import { useState, useEffect } from 'react';
import LinksEditor, { type ItemLink } from './LinksEditor';
import {
  IconPlus,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconSave,
  IconUpload,
  IconImage,
} from '@/components/Icons';

type BuiltIn = { code: string; title: string; category: string; description: string; image: string };
type Override = {
  title?: string;
  category?: string;
  description?: string;
  hidden?: boolean;
  links?: ItemLink[];
};
type CustomItem = {
  code: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  hidden?: boolean;
  links?: ItemLink[];
};

const CATEGORIES = [
  'Brownies',
  'Bento Cakes',
  'Birthday Cakes',
  'Fondant Cakes',
  'Cupcakes',
  'Donuts',
  'Bomboloni',
  'Pizza',
  'Other',
];

/**
 * Gallery Manager — full control of the /showcase page.
 *  - Edit the title, category and description of the original photos
 *  - Hide any photo from the public gallery
 *  - Upload brand-new gallery photos (straight to Cloudinary)
 *  - Edit, hide or permanently remove the photos you added
 */
export default function GalleryManager() {
  const [builtIn, setBuiltIn] = useState<BuiltIn[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [custom, setCustom] = useState<CustomItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [showBuiltIn, setShowBuiltIn] = useState(false);
  const [newLinks, setNewLinks] = useState<ItemLink[]>([]);

  useEffect(() => {
    load();
  }, []);

  function notify(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
  }

  async function load() {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      if (data.success) {
        setBuiltIn(data.builtIn || []);
        setOverrides(data.gallery?.overrides || {});
        setCustom(data.gallery?.custom || []);
      } else {
        notify('error', data.error || 'Could not load the gallery.');
      }
    } catch {
      notify('error', 'Could not load the gallery.');
    }
  }

  function setOverride(code: string, patch: Override) {
    setOverrides((o) => ({ ...o, [code]: { ...o[code], ...patch } }));
  }

  function effective(item: BuiltIn) {
    const o = overrides[item.code] || {};
    return {
      title: o.title ?? item.title,
      category: o.category ?? item.category,
      description: o.description ?? item.description,
      hidden: !!o.hidden,
      links: o.links ?? [],
      edited: !!(o.title || o.category || o.description || o.links?.length),
    };
  }

  async function saveOverrides() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides }),
      });
      const data = await res.json();
      if (data.success) {
        setOverrides(data.gallery.overrides || {});
        notify('success', 'Gallery saved! Changes appear on the website within about a minute.');
      } else {
        notify('error', data.error || 'Failed to save.');
      }
    } catch {
      notify('error', 'Failed to save.');
    }
    setSaving(false);
  }

  async function resetBuiltIn(code: string) {
    if (!confirm('Reset this photo back to its original title and description?')) return;
    setBusy(code);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setOverrides(data.gallery.overrides || {});
        setCustom(data.gallery.custom || []);
        notify('success', 'Photo reset to its original details.');
      } else {
        notify('error', data.error || 'Failed to reset.');
      }
    } catch {
      notify('error', 'Failed to reset.');
    }
    setBusy(null);
  }

  async function patchCustom(code: string, patch: Partial<CustomItem>) {
    setBusy(code);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...patch }),
      });
      const data = await res.json();
      if (data.success) setCustom(data.gallery.custom || []);
      else notify('error', data.error || 'Failed to update.');
    } catch {
      notify('error', 'Failed to update.');
    }
    setBusy(null);
  }

  async function removeCustom(item: CustomItem) {
    if (
      !confirm(
        `Permanently remove "${item.title}" from the gallery?\n\nThe photo will also be deleted from Cloudinary. This cannot be undone.`
      )
    )
      return;
    setBusy(item.code);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: item.code }),
      });
      const data = await res.json();
      if (data.success) {
        setCustom(data.gallery.custom || []);
        notify('success', 'Photo removed from the gallery.');
      } else {
        notify('error', data.error || 'Failed to remove.');
      }
    } catch {
      notify('error', 'Failed to remove.');
    }
    setBusy(null);
  }

  async function addPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      fd.set('links', JSON.stringify(newLinks));
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setCustom(data.gallery.custom || []);
        form.reset();
        setNewLinks([]);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        notify('success', `"${data.item.title}" added to the gallery.`);
      } else {
        notify('error', data.error || 'Failed to add photo.');
      }
    } catch {
      notify('error', 'Failed to add photo.');
    }
    setAdding(false);
  }

  const categories = ['All', ...CATEGORIES];
  const filteredBuiltIn =
    filter === 'All' ? builtIn : builtIn.filter((b) => effective(b).category === filter);
  const hiddenCount = builtIn.filter((b) => effective(b).hidden).length;

  return (
    <div className="menu-manager">
      <div className="post-manager-header">
        <div>
          <h2>Gallery Manager</h2>
          <p className="muted">
            Control the /showcase page: edit or hide the original photos, and upload new ones.
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

      {/* ---------- Add a new photo ---------- */}
      <h3 className="menu-section-title">Add a gallery photo</h3>
      <form className="post-form" onSubmit={addPhoto}>
        <div className="form-row">
          <label>
            Title *
            <input type="text" name="title" required maxLength={120} placeholder="e.g. Rainbow Unicorn Cake" />
          </label>
          <label>
            Category *
            <select name="category" required defaultValue="Birthday Cakes">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea
            name="description"
            rows={2}
            maxLength={600}
            placeholder="Leave empty to use a sensible default description."
          />
        </label>
        <label className="file-input-label">
          Photo *
          <span className="file-hint">WebP, JPG or PNG; maximum 8 MB</span>
          <input
            type="file"
            name="image"
            required
            accept="image/webp,image/jpeg,image/png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (preview) URL.revokeObjectURL(preview);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </label>
        <LinksEditor links={newLinks} onChange={setNewLinks} />

        {preview && (
          <div className="post-preview">
            <p className="post-preview-label">Preview:</p>
            <div className="showcase-card post-preview-card">
              <img src={preview} alt="New gallery item" />
            </div>
          </div>
        )}
        <div className="post-submit-row">
          <button className="btn gold" type="submit" disabled={adding}>
            <IconUpload size={16} /> {adding ? 'Uploading…' : 'Add to gallery'}
          </button>
        </div>
      </form>

      {/* ---------- Photos you added ---------- */}
      <h3 className="menu-section-title" style={{ marginTop: 30 }}>
        Photos you added ({custom.length})
      </h3>
      {custom.length ? (
        <div className="style-grid">
          {custom.map((c) => (
            <div className={`style-card ${c.hidden ? 'is-hidden' : ''}`} key={c.code}>
              <img src={c.image_url} alt={c.title} loading="lazy" />
              <span className="style-code">
                {c.code} · ADDED{c.hidden ? ' · HIDDEN' : ''}
              </span>
              <input
                type="text"
                defaultValue={c.title}
                aria-label={`Title for ${c.code}`}
                onBlur={(e) => e.target.value !== c.title && patchCustom(c.code, { title: e.target.value })}
              />
              <select
                defaultValue={c.category}
                aria-label={`Category for ${c.code}`}
                onChange={(e) => patchCustom(c.code, { category: e.target.value })}
              >
                {CATEGORIES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <textarea
                defaultValue={c.description}
                aria-label={`Description for ${c.code}`}
                onBlur={(e) =>
                  e.target.value !== c.description && patchCustom(c.code, { description: e.target.value })
                }
              />
              <LinksEditor
                compact
                links={c.links || []}
                onChange={(links) => patchCustom(c.code, { links })}
              />
              <div className="repeat-actions">
                <button
                  type="button"
                  className="icon-btn"
                  disabled={busy === c.code}
                  onClick={() => patchCustom(c.code, { hidden: !c.hidden })}
                >
                  {c.hidden ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                  {c.hidden ? 'Show' : 'Hide'}
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  disabled={busy === c.code}
                  onClick={() => removeCustom(c)}
                >
                  <IconTrash size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">
          You have not added any gallery photos yet. Use the form above — they appear at the top of
          the gallery.
        </p>
      )}

      {/* ---------- The original photos ---------- */}
      <h3 className="menu-section-title" style={{ marginTop: 30 }}>
        Original photos ({builtIn.length}){hiddenCount ? ` · ${hiddenCount} hidden` : ''}
      </h3>
      <p className="muted" style={{ margin: '0 0 10px' }}>
        These live in your Cloudinary <b>previous-orders</b> folder. You can rename, recategorise or
        hide them here. Hiding removes them from the public gallery without deleting anything.
      </p>

      <div className="style-toolbar">
        <button className="btn small outline" type="button" onClick={() => setShowBuiltIn((v) => !v)}>
          <IconImage size={14} /> {showBuiltIn ? 'Hide the list' : 'Show and edit the original photos'}
        </button>
        {showBuiltIn && (
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
        )}
        {showBuiltIn && <span className="badge-soft">{filteredBuiltIn.length} shown</span>}
      </div>

      {showBuiltIn && (
        <>
          <div className="style-grid">
            {filteredBuiltIn.map((item) => {
              const eff = effective(item);
              return (
                <div className={`style-card ${eff.hidden ? 'is-hidden' : ''}`} key={item.code}>
                  <img src={item.image} alt={eff.title} loading="lazy" />
                  <span className="style-code">
                    {item.code}
                    {eff.hidden ? ' · HIDDEN' : eff.edited ? ' · EDITED' : ''}
                  </span>
                  <input
                    type="text"
                    value={eff.title}
                    aria-label={`Title for ${item.code}`}
                    onChange={(e) => setOverride(item.code, { title: e.target.value })}
                  />
                  <select
                    value={eff.category}
                    aria-label={`Category for ${item.code}`}
                    onChange={(e) => setOverride(item.code, { category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={eff.description}
                    aria-label={`Description for ${item.code}`}
                    onChange={(e) => setOverride(item.code, { description: e.target.value })}
                  />
                  <LinksEditor
                    compact
                    links={eff.links}
                    onChange={(links) => setOverride(item.code, { links })}
                  />
                  <div className="repeat-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setOverride(item.code, { hidden: !eff.hidden })}
                    >
                      {eff.hidden ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                      {eff.hidden ? 'Show' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      disabled={busy === item.code}
                      onClick={() => resetBuiltIn(item.code)}
                    >
                      <IconTrash size={13} /> Reset
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="post-submit-row" style={{ marginTop: 12 }}>
            <button className="btn gold" type="button" onClick={saveOverrides} disabled={saving}>
              <IconSave size={16} /> {saving ? 'Saving…' : 'Save gallery changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
