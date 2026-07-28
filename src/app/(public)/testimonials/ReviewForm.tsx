'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconStar, IconShield, IconCheckCircle, IconArrowRight } from '@/components/Icons';

const HONEYPOT_FIELD = 'website_url';
const TIMESTAMP_FIELD = 'order_timestamp';

type Step = 'verify' | 'write' | 'done';

/**
 * Verified review form.
 *
 * Step 1 — the customer proves they ordered from us with their order ID and
 *          the WhatsApp number used on that order (same check as /track).
 * Step 2 — they write the review.
 * It is then held for admin approval before appearing on the site.
 */
export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('verify');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState(0);

  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    setLoadedAt(Date.now());
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(
        `/api/reviews?order_id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (data.success) {
        setProductName(data.order.product_name || '');
        setName(data.order.customer_name || '');
        setStep('write');
      } else {
        setError(data.error || 'We could not verify that order.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          phone,
          customer_name: name,
          rating,
          body,
          [HONEYPOT_FIELD]: honeypot,
          [TIMESTAMP_FIELD]: String(loadedAt),
        }),
      });
      const data = await res.json();
      if (data.success) setStep('done');
      else setError(data.error || 'Could not save your review.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <div className="notice review-cta">
        <div className="section-title-row">
          <IconShield size={22} className="section-icon" />
          <h2>Ordered from us? Share your experience</h2>
        </div>
        <p>
          Reviews on this page come only from customers who have actually ordered. You will need
          your order ID (<b>DH-YYYY-XXXXXX</b>) and the WhatsApp number you ordered with.
        </p>
        <button className="btn gold icon-right" type="button" onClick={() => setOpen(true)}>
          Write a review <IconArrowRight size={17} />
        </button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="notice review-cta">
        <div className="section-title-row">
          <IconCheckCircle size={22} className="section-icon" />
          <h2>Thank you!</h2>
        </div>
        <p>
          Your review has been received. We read every one, and it will appear on this page shortly
          once we have checked it.
        </p>
        <Link className="btn gold icon-right" href="/order">
          Order again <IconArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="form review-form">
      {step === 'verify' ? (
        <form onSubmit={verify}>
          <div className="section-title-row">
            <IconShield size={22} className="section-icon" />
            <h2>Verify your order</h2>
          </div>
          <p className="muted">
            This keeps our reviews honest — only real customers can post one.
          </p>

          <label htmlFor="rv-order">Order ID</label>
          <input
            id="rv-order"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="DH-2026-0001"
            autoComplete="off"
          />

          <label htmlFor="rv-phone">WhatsApp number used for the order</label>
          <input
            id="rv-phone"
            required
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit number"
            autoComplete="tel"
          />

          {error && <p className="form-error">{error}</p>}

          <div className="hero-actions" style={{ marginTop: 18 }}>
            <button className="btn gold" type="submit" disabled={busy}>
              {busy ? 'Checking…' : 'Continue'}
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Lost your order ID? Find it on <Link href="/track">the tracking page</Link> or ask us on
            WhatsApp.
          </p>
        </form>
      ) : (
        <form onSubmit={submit}>
          <div className="section-title-row">
            <IconCheckCircle size={22} className="section-icon" />
            <h2>Write your review</h2>
          </div>
          <p className="muted">
            Verified order <b>{orderId.toUpperCase()}</b>
            {productName ? ` · ${productName}` : ''}
          </p>

          <label htmlFor="rv-name">Your name (shown as first name + initial)</label>
          <input
            id="rv-name"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label id="rv-rating-label">Your rating</label>
          <div className="rating-picker" role="radiogroup" aria-labelledby="rv-rating-label">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={`rating-star ${n <= rating ? 'on' : ''}`}
                onClick={() => setRating(n)}
              >
                <IconStar size={30} filled={n <= rating} />
              </button>
            ))}
            <span className="muted">
              {rating} star{rating > 1 ? 's' : ''}
            </span>
          </div>

          <label htmlFor="rv-body">Your review</label>
          <textarea
            id="rv-body"
            required
            minLength={15}
            maxLength={900}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How was the taste, the design, the delivery?"
          />

          {/* honeypot — hidden from people, tempting to bots */}
          <input
            type="text"
            name={HONEYPOT_FIELD}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
          />

          {error && <p className="form-error">{error}</p>}

          <div className="hero-actions" style={{ marginTop: 18 }}>
            <button className="btn gold" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Submit review'}
            </button>
            <button className="btn" type="button" onClick={() => setStep('verify')}>
              Back
            </button>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Your review is checked by us before it appears, usually within a day.
          </p>
        </form>
      )}
    </div>
  );
}
