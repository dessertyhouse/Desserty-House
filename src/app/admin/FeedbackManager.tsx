'use client';

import { useState, useEffect } from 'react';
import {
  IconPlus,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconSave,
  IconUpload,
  IconQuote,
} from '@/components/Icons';

type FeedbackItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  is_published: boolean;
  created_at: string;
};

/**
 * Feedback Manager — the customer feedback wall (/feedback).
 *
 * These are screenshots of real WhatsApp / Instagram messages that customers
 * sent us. The owner uploads them here; nothing is ever posted by a customer.
 */
export default function FeedbackManager() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    load();
  }, []);

  function notify(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
  }

  async function load() {
    try {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      if (data.success) setItems(data.feedback || []);
      else notify('error', data.error || 'Could not load feedback.');
    } catch {
      notify('error', 'Could not load feedback.');
    }
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const form = e.currentTarget;
      const res = await fetch('/api/admin/feedback', { method: 'POST', body: new FormData(form) });
      const data = await res.json();
      if (data.success) {
        form.reset();
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        await load();
        notify('success', 'Feedback screenshot published.');
      } else {
        notify('error', data.error || 'Failed to upload.');
      }
    } catch {
      notify('error', 'Failed to upload.');
    }
    setAdding(false);
  }

  async function patch(id: string, body: Record<string, unknown>, note?: string) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (data.success) {
        await load();
        setEditing(null);
        if (note) notify('success', note);
      } else {
        notify('error', data.error || 'Failed to update.');
      }
    } catch {
      notify('error', 'Failed to update.');
    }
    setBusy(null);
  }

  async function remove(item: FeedbackItem) {
    if (
      !confirm(
        `Permanently delete "${item.title}"?\n\nThe screenshot will also be removed from Cloudinary. This cannot be undone.`
      )
    )
      return;
    setBusy(item.id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        await load();
        notify('success', 'Feedback deleted.');
      } else {
        notify('error', data.error || 'Failed to delete.');
      }
    } catch {
      notify('error', 'Failed to delete.');
    }
    setBusy(null);
  }

  const live = items.filter((i) => i.is_published).length;

  return (
    <div className="menu-manager">
      <div className="post-manager-header">
        <div>
          <h2>Customer Feedback Wall</h2>
          <p className="muted">
            Screenshots of WhatsApp and Instagram messages from customers. You post these — customers
            cannot upload anything themselves.
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

      {/* ---------- Upload ---------- */}
      <h3 className="menu-section-title">
        <IconPlus size={16} /> Add a chat screenshot
      </h3>
      <form className="post-form" onSubmit={add}>
        <label>
          Label *
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Priya — birthday bento cake"
          />
        </label>
        <label>
          Caption (optional)
          <textarea
            name="description"
            rows={2}
            maxLength={600}
            placeholder="A short line of context shown under the screenshot."
          />
        </label>
        <label className="file-input-label">
          Screenshot *
          <span className="file-hint">
            WebP, JPG or PNG; maximum 8 MB. Crop out phone numbers and surnames before uploading.
          </span>
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
        <label className="product-toggle">
          <input type="checkbox" name="publish" value="true" defaultChecked />
          <span>Publish immediately (untick to save it hidden)</span>
        </label>
        {preview && (
          <div className="post-preview">
            <p className="post-preview-label">Preview:</p>
            <div className="showcase-card post-preview-card">
              <img src={preview} alt="Feedback screenshot" />
            </div>
          </div>
        )}
        <div className="post-submit-row">
          <button className="btn gold" type="submit" disabled={adding}>
            <IconUpload size={16} /> {adding ? 'Uploading…' : 'Add to feedback wall'}
          </button>
        </div>
        <p className="muted post-submit-hint">
          Please only publish screenshots the customer is happy for you to share, with personal
          details cropped out.
        </p>
      </form>

      {/* ---------- Existing ---------- */}
      <h3 className="menu-section-title" style={{ marginTop: 30 }}>
        <IconQuote size={16} /> On the wall ({items.length}
        {items.length ? ` · ${live} live` : ''})
      </h3>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No feedback screenshots yet.</p>
          <p className="muted">Upload your first one above — it appears on the /feedback page.</p>
        </div>
      ) : (
        <div className="style-grid">
          {items.map((item) => (
            <div className={`style-card ${item.is_published ? '' : 'is-hidden'}`} key={item.id}>
              <img src={item.image_url} alt={item.title} loading="lazy" />
              <span className="style-code">
                {item.is_published ? 'LIVE' : 'HIDDEN'} ·{' '}
                {new Date(item.created_at).toLocaleDateString('en-IN')}
              </span>

              {editing?.id === item.id ? (
                <>
                  <input
                    type="text"
                    value={editing.title}
                    aria-label="Label"
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                  <textarea
                    value={editing.description || ''}
                    aria-label="Caption"
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                  <div className="repeat-actions">
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === item.id}
                      onClick={() =>
                        patch(
                          item.id,
                          { title: editing.title, description: editing.description },
                          'Feedback updated.'
                        )
                      }
                    >
                      <IconSave size={13} /> Save
                    </button>
                    <button className="icon-btn" type="button" onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <b style={{ display: 'block', fontSize: 13, margin: '6px 0 2px' }}>{item.title}</b>
                  {item.description && (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                      {item.description}
                    </p>
                  )}
                  <div className="repeat-actions">
                    <button className="icon-btn" type="button" onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === item.id}
                      onClick={() =>
                        patch(
                          item.id,
                          { is_published: !item.is_published },
                          item.is_published ? 'Hidden from the wall.' : 'Now live on the wall.'
                        )
                      }
                    >
                      {item.is_published ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                      {item.is_published ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className="icon-btn danger"
                      type="button"
                      disabled={busy === item.id}
                      onClick={() => remove(item)}
                    >
                      <IconTrash size={13} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
