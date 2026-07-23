'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { products } from '../products';

// CAPTCHA field names (must match lib/captcha.ts)
const HONEYPOT_FIELD = 'website_url';
const TIMESTAMP_FIELD = 'order_timestamp';

function OrderForm() {
  const searchParams = useSearchParams();
  const initialProduct = searchParams.get('product') || 'BRW-001';
  const styleCode = searchParams.get('style') || '';
  const showcaseCode = searchParams.get('showcase') || '';

  const [done, setDone] = useState<{
    success?: boolean;
    order_id?: string;
    whatsapp_url?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitTime, setSubmitTime] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Set timestamp when form loads
  useEffect(() => {
    setSubmitTime(Date.now());
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    // Collect form values
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value;
      }
    });

    // Add timestamp
    data[TIMESTAMP_FIELD] = String(submitTime);

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!data.customer_name?.trim()) {
      newErrors.customer_name = 'Please enter your name';
    }

    const phone = data.phone?.replace(/\D/g, '') || '';
    if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit WhatsApp number';
    }

    if (!data.event_date) {
      newErrors.event_date = 'Please select a required date';
    } else {
      // Check if date is in the future
      const selectedDate = new Date(data.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.event_date = 'Please select a future date';
      }
    }

    if (!data.quantity?.trim()) {
      newErrors.quantity = 'Please enter the quantity needed';
    }

    if (!data.area?.trim()) {
      newErrors.area = 'Please enter your Chennai locality';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setDone(result);
      } else {
        setDone({ error: result.error || 'Failed to submit order. Please try again.' });
      }
    } catch (error) {
      setDone({ error: 'Network error. Please check your connection and try again.' });
    }

    setBusy(false);
  }

  // Success state
  if (done?.success && done.order_id) {
    return (
      <main className="shell section">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h1>Thank you!</h1>
          <div className="notice success-notice">
            <p className="order-id-label">Your order request ID</p>
            <p className="order-id">{done.order_id}</p>
            <p className="order-message">{done.message}</p>
          </div>
          
          <div className="next-steps">
            <h3>Next steps:</h3>
            <ol>
              <li>
                <span className="step-number">1</span>
                <div>
                  <strong>Continue on WhatsApp</strong>
                  <p>Send the order ID to confirm your order and receive payment instructions.</p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div>
                  <strong>Wait for confirmation</strong>
                  <p>We will reply with availability, pricing, and delivery details.</p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div>
                  <strong>Make payment</strong>
                  <p>Once confirmed, we will share UPI/QR for advance payment.</p>
                </div>
              </li>
            </ol>
          </div>

          <a className="btn gold whatsapp-btn" href={done.whatsapp_url} target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Continue on WhatsApp to confirm
          </a>

          <p className="track-link">
            <Link href="/track">Track your order →</Link>
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (done?.error) {
    return (
      <main className="shell section">
        <div className="order-error">
          <div className="error-icon">!</div>
          <h1>Oops!</h1>
          <div className="notice error-notice">
            <p>{done.error}</p>
          </div>
          <button className="btn gold" onClick={() => setDone(null)}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  // Form state
  return (
    <main className="shell section">
      <div className="eyebrow">ORDER REQUEST</div>
      <h1>Tell us about your celebration.</h1>
      <p className="muted order-intro">
        No payment is collected here. The bakery confirms all prices, delivery 
        and payment manually on WhatsApp. Fill in the details below and we will 
        get back to you.
      </p>

      {(styleCode || showcaseCode) && (
        <div className="notice selected-reference">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <strong>Selected reference: {styleCode || showcaseCode}</strong>
            <p>You may change it or explain alterations in the design notes below.</p>
          </div>
        </div>
      )}

      <form className="form order-form" onSubmit={submit} ref={formRef}>
        {/* Hidden fields for CAPTCHA */}
        <input 
          type="text" 
          name={HONEYPOT_FIELD} 
          tabIndex={-1} 
          autoComplete="off"
          className="honeypot-field"
        />
        <input 
          type="hidden" 
          name={TIMESTAMP_FIELD} 
          value={submitTime} 
        />

        <input type="hidden" name="style_code" value={styleCode} />
        <input type="hidden" name="showcase_code" value={showcaseCode} />

        <div className="form-section">
          <h3>What would you like?</h3>
          
          <label className={errors.product_id ? 'error' : ''}>
            Product / Product ID
            <select name="product_id" defaultValue={initialProduct}>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
            {errors.product_id && <span className="field-error">{errors.product_id}</span>}
          </label>
        </div>

        <div className="form-section">
          <h3>Your details</h3>
          
          <label className={errors.customer_name ? 'error' : ''}>
            Your name *
            <input 
              type="text" 
              name="customer_name" 
              required
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
          </label>

          <label className={errors.phone ? 'error' : ''}>
            WhatsApp number *
            <input 
              type="tel" 
              name="phone" 
              required
              inputMode="tel"
              placeholder="10-digit mobile number"
              autoComplete="tel"
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
            <span className="field-hint">We will use this to send order updates</span>
          </label>
        </div>

        <div className="form-section">
          <h3>Order details</h3>
          
          <label className={errors.event_date ? 'error' : ''}>
            Celebration / Required date *
            <input 
              type="date" 
              name="event_date" 
              required
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.event_date && <span className="field-error">{errors.event_date}</span>}
          </label>

          <label>
            Egg preference
            <select name="egg_preference">
              <option>Egg</option>
              <option>Eggless</option>
              <option>No preference</option>
            </select>
          </label>

          <label className={errors.quantity ? 'error' : ''}>
            Quantity / Servings *
            <input 
              type="text" 
              name="quantity" 
              required
              placeholder="e.g., 1 kg, 12 cupcakes, serves 15"
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </label>

          <label className={errors.area ? 'error' : ''}>
            Delivery or pickup area *
            <input 
              type="text" 
              name="area" 
              required
              placeholder="Chennai locality (e.g., Anna Nagar, T. Nagar)"
            />
            {errors.area && <span className="field-error">{errors.area}</span>}
          </label>
        </div>

        <div className="form-section">
          <h3>Customization</h3>
          
          <label>
            Theme, flavour or design details
            <textarea 
              name="notes" 
              placeholder="Tell us about your celebration theme, preferred flavours, colors, or any special requests. You can also share inspiration images on WhatsApp after submitting."
              rows={4}
            />
          </label>
        </div>

        <div className="form-footer">
          <div className="privacy-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>Your information is used only to process your order. <Link href="/privacy">Privacy Policy</Link></span>
          </div>

          <button type="submit" className="btn gold submit-btn" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit order request'
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function Order() {
  return (
    <Suspense fallback={
      <main className="shell section">
        <div className="loading-state">
          <div className="spinner large"></div>
          <p>Loading order form...</p>
        </div>
      </main>
    }>
      <OrderForm />
    </Suspense>
  );
}
