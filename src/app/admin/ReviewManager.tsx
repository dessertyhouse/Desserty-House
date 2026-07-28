'use client';

import { useState, useEffect } from 'react';
import {
  IconStar,
  IconCheckCircle,
  IconX,
  IconTrash,
  IconRefresh,
  IconSave,
  IconShield,
  IconAlert,
  IconEye,
  IconEyeOff,
} from '@/components/Icons';

type Review = {
  id: string;
  order_id: string;
  phone: string;
  product_id: string | null;
  product_name: string | null;
  customer_name: string;
  rating: number;
  body: string;
  status: 'pending' | 'approved' | 'hidden' | 'rejected';
  admin_note: string | null;
  created_at: string;
};

/**
 * Review Manager — moderation queue for customer reviews.
 *
 * Every review here was written by someone who proved they bought from us
 * (order ID + WhatsApp number verified against the orders table). Nothing is
 * published until the owner approves it.
 */
export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, hidden: 0, rejected: 0 });
  const [needsMigration, setNeedsMigration] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'hidden' | 'rejected' | 'all'>(
    'pending'
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);

  useEffect(() => {
    load();
  }, []);

  function notify(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
  }

  async function load() {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setCounts(data.counts || { pending: 0, approved: 0, hidden: 0, rejected: 0 });
        setNeedsMigration(!!data.needsMigration);
      } else {
        notify('error', data.error || 'Could not load reviews.');
      }
    } catch {
      notify('error', 'Could not load reviews.');
    }
  }

  async function patch(id: string, body: Record<string, unknown>, note?: string) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/reviews', {
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

  async function remove(r: Review) {
    if (!confirm(`Permanently delete the review from ${r.customer_name} (${r.order_id})?`)) return;
    setBusy(r.id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id }),
      });
      const data = await res.json();
      if (data.success) {
        await load();
        notify('success', 'Review deleted.');
      } else {
        notify('error', data.error || 'Failed to delete.');
      }
    } catch {
      notify('error', 'Failed to delete.');
    }
    setBusy(null);
  }

  const shown = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="menu-manager">
      <div className="post-manager-header">
        <div>
          <h2>Customer Reviews</h2>
          <p className="muted">
            Only customers with a real order ID can write these. Approve one to publish it — and
            hide any review that is unwanted or abusive.
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

      {needsMigration && (
        <div className="message error">
          <IconAlert size={16} /> The reviews table does not exist yet. Run{' '}
          <b>sql/gallery-reviews-migration.sql</b> in your Supabase SQL editor, then refresh.
        </div>
      )}

      <div className="style-toolbar">
        {(['pending', 'approved', 'hidden', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`btn small ${filter === f ? 'gold' : 'outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' ? ` (${counts[f]})` : ''}
          </button>
        ))}
      </div>

      {counts.pending > 0 && filter !== 'pending' && (
        <p className="muted">
          <IconAlert size={14} /> {counts.pending} review{counts.pending > 1 ? 's are' : ' is'}{' '}
          waiting for your approval.
        </p>
      )}

      {shown.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'pending'
              ? 'No reviews waiting for approval.'
              : `No ${filter === 'all' ? '' : filter} reviews yet.`}
          </p>
          <p className="muted">
            Customers can leave one at <b>/testimonials</b> using their order ID and WhatsApp number.
          </p>
        </div>
      ) : (
        shown.map((r) => (
          <div
            className={`repeat-item ${r.status === 'hidden' ? 'is-hidden-review' : ''}`}
            key={r.id}
          >
            <div className="repeat-item-head">
              <b>
                {r.customer_name} ·{' '}
                <span className="stars" style={{ color: '#d99a2b' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <IconStar key={i} size={13} filled={i < r.rating} />
                  ))}
                </span>
              </b>
              <span className={`badge-soft status-${r.status}`}>{r.status.toUpperCase()}</span>
            </div>

            <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
              <IconShield size={13} /> Verified order <b>{r.order_id}</b>
              {r.product_name ? ` · ${r.product_name}` : ''} ·{' '}
              {new Date(r.created_at).toLocaleDateString('en-IN')}
            </p>

            {editing?.id === r.id ? (
              <>
                <div className="form-row">
                  <label>
                    Display name
                    <input
                      type="text"
                      value={editing.customer_name}
                      onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })}
                    />
                  </label>
                  <label>
                    Rating
                    <select
                      value={editing.rating}
                      onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Review text
                  <textarea
                    rows={3}
                    value={editing.body}
                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  />
                </label>
                <label>
                  Private note (never shown publicly)
                  <input
                    type="text"
                    value={editing.admin_note || ''}
                    onChange={(e) => setEditing({ ...editing, admin_note: e.target.value })}
                  />
                </label>
                <div className="repeat-actions">
                  <button
                    className="btn small gold"
                    type="button"
                    disabled={busy === r.id}
                    onClick={() =>
                      patch(
                        r.id,
                        {
                          customer_name: editing.customer_name,
                          rating: editing.rating,
                          body: editing.body,
                          admin_note: editing.admin_note,
                        },
                        'Review updated.'
                      )
                    }
                  >
                    <IconSave size={14} /> Save
                  </button>
                  <button className="btn small outline" type="button" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <blockquote style={{ margin: '0 0 10px' }}>
                  <p>{r.body}</p>
                </blockquote>
                {r.admin_note && (
                  <p className="muted" style={{ fontSize: 12 }}>
                    Private note: {r.admin_note}
                  </p>
                )}
                <div className="repeat-actions">
                  {r.status !== 'approved' && r.status !== 'hidden' && (
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: 'approved' }, 'Review published.')}
                    >
                      <IconCheckCircle size={14} /> Approve &amp; publish
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: 'rejected' }, 'Review rejected.')}
                    >
                      <IconX size={14} /> Reject
                    </button>
                  )}
                  {r.status === 'approved' && (
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === r.id}
                      title="Take this review off the website (it stays here so you can restore it)"
                      onClick={() =>
                        patch(r.id, { status: 'hidden' }, 'Review hidden from the website.')
                      }
                    >
                      <IconEyeOff size={14} /> Hide from website
                    </button>
                  )}
                  {r.status === 'hidden' && (
                    <button
                      className="icon-btn"
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: 'approved' }, 'Review is live again.')}
                    >
                      <IconEye size={14} /> Show again
                    </button>
                  )}
                  <button className="icon-btn" type="button" onClick={() => setEditing(r)}>
                    Edit
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => remove(r)}
                  >
                    <IconTrash size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
