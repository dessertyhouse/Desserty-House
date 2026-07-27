import { createClient } from '@supabase/supabase-js';

/**
 * Verified customer reviews.
 *
 * A review can only be written by someone who actually bought from us: the
 * form asks for the order ID (DH-YYYY-XXXXXX) and the WhatsApp number used on
 * that order, and both must match a real row in `orders` — the same proof the
 * /track page requires.
 *
 * Reviews then sit in 'pending' until the admin approves them, so nothing
 * reaches the public site (or Google's review markup) without a human check.
 */

export type ReviewStatus = 'pending' | 'approved' | 'hidden' | 'rejected';

export type Review = {
  id: string;
  order_id: string;
  phone: string;
  product_id: string | null;
  product_name: string | null;
  customer_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

/** Shape used by the public testimonials page. */
export type PublicReview = {
  name: string;
  rating: number;
  date: string;
  product: string;
  text: string;
  verified: true;
};

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/** Keep only digits, and drop a leading 91 country code, so 10-digit compare works. */
export function normalisePhone(input: string): string {
  const digits = String(input || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Show "Priya R." rather than the customer's full name. */
export function displayName(fullName: string): string {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Customer';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Confirm an order ID + phone pair belongs to a real order.
 * Returns the order when valid, otherwise null.
 */
export async function verifyOrder(orderId: string, phone: string) {
  const id = String(orderId || '').trim().toUpperCase();
  const wanted = normalisePhone(phone);
  if (!id || wanted.length !== 10) return null;

  try {
    const { data } = await db()
      .from('orders')
      .select('order_id, phone, product_id, customer_name, status')
      .eq('order_id', id)
      .limit(1);

    const order = data?.[0];
    if (!order) return null;
    if (normalisePhone(order.phone) !== wanted) return null;
    return order;
  } catch {
    return null;
  }
}

/** Approved reviews for the public testimonials page. */
export async function getApprovedReviews(limit = 60): Promise<PublicReview[]> {
  try {
    const { data } = await db()
      .from('reviews')
      .select('customer_name, rating, body, product_name, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map((r) => ({
      name: displayName(r.customer_name),
      rating: Number(r.rating) || 5,
      date: String(r.created_at).slice(0, 10),
      product: r.product_name || 'Order',
      text: r.body,
      verified: true as const,
    }));
  } catch {
    // table not migrated yet — the page simply shows the curated list
    return [];
  }
}
