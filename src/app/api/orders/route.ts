import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { validateCaptcha, HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/captcha';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';

// WhatsApp number for the bakery
const WHATSAPP_NUMBER = '918939411490';

/**
 * POST /api/orders - Submit a new order request
 * Rate limited: 10 requests per minute per IP
 * Protected by honeypot CAPTCHA
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.orderSubmission);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many order requests. Please wait a moment and try again.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetIn)
          }
        }
      );
    }

    const body = await request.json();

    // Validate CAPTCHA
    const captchaResult = validateCaptcha(body);
    if (!captchaResult.isValid) {
      return NextResponse.json(
        { error: captchaResult.error || 'Invalid submission.' },
        { status: 400 }
      );
    }

    // Remove CAPTCHA fields before processing
    const { [HONEYPOT_FIELD]: _hp, [TIMESTAMP_FIELD]: _ts, ...orderData } = body;

    // Validate phone number (10 digits)
    const phone = String(body.phone || '').replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit WhatsApp number.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.customer_name?.trim()) {
      return NextResponse.json(
        { error: 'Please enter your name.' },
        { status: 400 }
      );
    }

    if (!body.event_date) {
      return NextResponse.json(
        { error: 'Please select a required date.' },
        { status: 400 }
      );
    }

    if (!body.quantity?.trim()) {
      return NextResponse.json(
        { error: 'Please enter the quantity/servings needed.' },
        { status: 400 }
      );
    }

    if (!body.area?.trim()) {
      return NextResponse.json(
        { error: 'Please enter your Chennai locality.' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const id = `DH-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // Build order record
    const orderRecord = {
      order_id: id,
      product_id: body.product_id || 'BRW-001',
      style_code: body.style_code || null,
      customer_name: body.customer_name.trim(),
      phone: phone,
      event_date: body.event_date,
      egg_preference: body.egg_preference || 'No preference',
      quantity: body.quantity.trim(),
      area: body.area.trim(),
      notes: [
        body.notes,
        body.showcase_code ? `Previous-order reference: ${body.showcase_code}` : ''
      ].filter(Boolean).join(' | '),
      status: 'Request received',
      payment_status: 'Not requested',
      source: 'Website'
    };

    // Insert into database
    const { error } = await supabaseAdmin.from('orders').insert(orderRecord);

    if (error) {
      console.error('Order insert error:', error);
      throw new Error('Failed to save order');
    }

    // Log audit event
    await logAuditEvent({
      action: 'order_created',
      entity_type: 'order',
      entity_id: id,
      new_value: orderRecord,
      ...createAuditContext(request)
    });

    // Create WhatsApp message
    const whatsappText = encodeURIComponent(
      `Hello Dessert(y) House! 🍰\n\nI submitted order request ${id}.\n\nProduct: ${body.product_id}\nDate needed: ${body.event_date}\nQuantity: ${body.quantity}\nEgg preference: ${body.egg_preference || 'No preference'}\n\nPlease confirm availability and price. Thank you!`
    );

    return NextResponse.json({
      success: true,
      order_id: id,
      whatsapp_url: `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`,
      message: 'Your order has been submitted successfully!'
    });

  } catch (error) {
    console.error('Order submission error:', error);
    return NextResponse.json(
      { error: 'Could not save your order. Please try again or order directly on WhatsApp.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders - Track order status
 * Rate limited: 100 requests per minute per IP
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.orderLookup);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please wait.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const phone = (searchParams.get('phone') || '').replace(/\D/g, '');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Please enter your order ID.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Please enter your WhatsApp number.' },
        { status: 400 }
      );
    }

    // Fetch order
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('order_id, product_id, quantity, event_date, status, payment_status, customer_message')
      .eq('order_id', orderId)
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      console.error('Order lookup error:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No matching order found. Please check your order ID and phone number.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data
    });

  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Unable to look up your order. Please try again.' },
      { status: 500 }
    );
  }
}
