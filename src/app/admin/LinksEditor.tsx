'use client';

import { IconPlus, IconTrash, IconExternal } from '@/components/Icons';

export type ItemLink = { url: string; label: string };

/**
 * Small reusable editor for the links attached to a post, feedback screenshot
 * or gallery photo. Up to five per item.
 *
 * The owner can paste a full URL, a bare domain (instagram.com/...), an
 * internal path (/order) or mailto:/tel: — the server sanitises whatever
 * arrives, and unsafe schemes are rejected.
 */
export default function LinksEditor({
  links,
  onChange,
  max = 5,
  compact = false,
}: {
  links: ItemLink[];
  onChange: (next: ItemLink[]) => void;
  max?: number;
  compact?: boolean;
}) {
  const list = Array.isArray(links) ? links : [];

  function update(i: number, patch: Partial<ItemLink>) {
    onChange(list.map((l, x) => (x === i ? { ...l, ...patch } : l)));
  }

  return (
    <div className={`links-editor ${compact ? 'is-compact' : ''}`.trim()}>
      <span className="links-editor-title">
        <IconExternal size={14} /> Links {list.length > 0 ? `(${list.length})` : ''}
      </span>
      {!compact && (
        <p className="hint links-editor-hint">
          Optional buttons shown under this item — a WhatsApp order link, an Instagram post, a
          menu page. Paste a full address, a page on this site like <code>/order</code>, or an
          email such as <code>mailto:you@shop.com</code>.
        </p>
      )}

      {list.map((l, i) => (
        <div className="link-row" key={i}>
          <input
            type="text"
            value={l.url}
            placeholder="https://wa.me/91… or /order"
            aria-label={`Link ${i + 1} address`}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <input
            type="text"
            value={l.label}
            maxLength={60}
            placeholder="Button text (optional)"
            aria-label={`Link ${i + 1} button text`}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <button
            type="button"
            className="icon-btn danger"
            aria-label={`Remove link ${i + 1}`}
            onClick={() => onChange(list.filter((_, x) => x !== i))}
          >
            <IconTrash size={13} />
          </button>
        </div>
      ))}

      {list.length < max && (
        <button
          type="button"
          className="icon-btn"
          onClick={() => onChange([...list, { url: '', label: '' }])}
        >
          <IconPlus size={13} /> Add link
        </button>
      )}
    </div>
  );
}
