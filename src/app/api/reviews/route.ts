import { NextRequest, NextResponse } from 'next/server';
import { db, verifyOrder, normalisePhone } from '@/lib/reviews';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { validateCaptcha } from '@/lib/captcha';
import { getMenuProducts } from '@/lib/menu';

export const runtime = 'nodejs';

/**
 * Public review endpoint — customers only.
 *
 * GET  ?order_id=..&phone=..  → checks the order exists and has no review yet,
 *                               so the form can show the right prompt.
 * POST                        → submits a review as 'pending' for admin approval.
 *
 * A review is only accepted when the order ID + WhatsApp number match a real
 * order, which is the same proof the /track page requires. Nothing is
 * published automatically.
 */

const txt = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Has this order already been reviewed? */
async function existingReview(orderId: string) {
  try {
    const { data } = await db()
      .from('reviews')
      .select('id, status')
      .eq('order_id', orderId)
      .limit(1);
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(getClientIP(request), RATE_LIMITS.orderLookup);
  if (!rate.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  const orderId = txt(request.nextUrl.searchParams.get('order_id'), 40).toUpperCase();
  const phone = txt(request.nextUrl.searchParams.get('phone'), 20);

  if (!orderId || !phone) {
    return NextResponse.json({ error: 'Order ID and WhatsApp number are required.' }, { status: 400 });
  }

  const order = await verifyOrder(orderId, phone);
  if (!order) {
    return NextResponse.json(
      {
        error:
          'We could not find an order with that ID and WhatsApp number. Please check both and try again.',
      },
      { status: 404 }
    );
  }

  const already = await existingReview(orderId);
  if (already) {
    return NextResponse.json(
      {
        error:
          already.status === 'approved'
            ? 'A review has already been published for this order. Thank you!'
            : 'We have already received your review for this order — it is awaiting approval.',
      },
      { status: 409 }
    );
  }

  // Resolve a friendly product name for the form
  let productName = order.product_id || '';
  try {
    const menu = await getMenuProducts();
    productName = menu.find((p) => p.id === order.product_id)?.name || productName;
  } catch {
    /* fall back to the raw product id */
  }

  return NextResponse.json({
    success: true,
    order: {
      order_id: order.order_id,
      customer_name: order.customer_name,
      product_id: order.product_id,
      product_name: productName,
    },
  });
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(getClientIP(request), RATE_LIMITS.orderSubmission);
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Honeypot + timing check (same protection as the order form)
    const captcha = validateCaptcha(body as Record<string, string>);
    if (!captcha.isValid) {
      return NextResponse.json({ error: 'Submission rejected. Please try again.' }, { status: 400 });
    }

    const orderId = txt(body.order_id, 40).toUpperCase();
    const phone = txt(body.phone, 20);
    const customerName = txt(body.customer_name, 60);
    const reviewBody = txt(body.body, 900);
    const ratingRaw = Number(body.rating);
    const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 0;

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: 'Your order ID and WhatsApp number are required.' },
        { status: 400 }
      );
    }
    if (!customerName) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!rating) {
      return NextResponse.json({ error: 'Please choose a star rating.' }, { status: 400 });
    }
    if (reviewBody.length < 15) {
      return NextResponse.json(
        { error: 'Please write at least a sentence about your order.' },
        { status: 400 }
      );
    }

    // Proof of purchase
    const order = await verifyOrder(orderId, phone);
    if (!order) {
      return NextResponse.json(
        {
          error:
            'We could not verify that order. Only customers who have ordered from us can leave a review.',
        },
        { status: 403 }
      );
    }

    const already = await existingReview(orderId);
    if (already) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this order.' },
        { status: 409 }
      );
    }

    let productName = order.product_id || '';
    try {
      const menu = await getMenuProducts();
      productName = menu.find((p) => p.id === order.product_id)?.name || productName;
    } catch {
      /* keep raw id */
    }

    const { error } = await db().from('reviews').insert({
      order_id: orderId,
      phone: normalisePhone(phone),
      product_id: order.product_id,
      product_name: productName,
      customer_name: customerName,
      rating,
      body: reviewBody,
      status: 'pending',
    });

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json(
        {
          error:
            'Could not save your review. If this keeps happening, please send it to us on WhatsApp.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Thank you! Your review has been received and will appear on the site once we have checked it.',
    });
  } catch (e) {
    console.error('Review POST error:', e);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
