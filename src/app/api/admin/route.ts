import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

/**
 * Middleware to verify admin authentication
 */
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  // Check session-based auth
  const sessionAuth = await verifyAdminSession();
  
  // Also check header password for backward compatibility
  const headerPassword = request.headers.get('x-admin-password');
  const validPassword = headerPassword === process.env.ADMIN_DASHBOARD_PASSWORD;
  
  if (!sessionAuth && !validPassword) {
    return { 
      authorized: false, 
      response: NextResponse.json(
        { error: 'Unauthorized. Please log in to the admin dashboard.' },
        { status: 401 }
      )
    };
  }

  // Rate limiting for admin operations
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.adminOperations);
  
  if (!rateLimit.success) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    };
  }

  return { authorized: true };
}

/**
 * GET /api/admin - Fetch all orders
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Orders fetch error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin - Update order
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    // Fetch current order for audit log
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    // Allowed fields for update
    const allowedFields: Record<string, unknown> = {};
    const fieldMapping: Record<string, string> = {
      status: 'status',
      payment_status: 'payment_status',
      customer_message: 'customer_message',
      scheduled_at: 'scheduled_at',
      admin_notes: 'admin_notes'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key]) {
        allowedFields[key] = value ?? null;
      }
    }

    // Update order
    const { error } = await supabaseAdmin
      .from('orders')
      .update(allowedFields)
      .eq('id', id);

    if (error) {
      console.error('Order update error:', error);
      throw error;
    }

    // Log audit event
    const changedFields: Record<string, { old: unknown; new: unknown }> = {};
    for (const [key, newValue] of Object.entries(allowedFields)) {
      const oldValue = currentOrder?.[key];
      if (oldValue !== newValue) {
        changedFields[key] = { old: oldValue, new: newValue };
      }
    }

    if (Object.keys(changedFields).length > 0) {
      // Determine action type
      let action: 'order_status_changed' | 'order_payment_changed' | 'order_notes_updated' | 'order_schedule_updated' | 'order_customer_message_updated' = 'order_notes_updated';
      
      if ('status' in changedFields) action = 'order_status_changed';
      else if ('payment_status' in changedFields) action = 'order_payment_changed';
      else if ('scheduled_at' in changedFields) action = 'order_schedule_updated';
      else if ('customer_message' in changedFields) action = 'order_customer_message_updated';

      await logAuditEvent({
        action,
        entity_type: 'order',
        entity_id: body.order_id || id,
        old_value: changedFields,
        new_value: allowedFields,
        ...createAuditContext(request)
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully.',
      changes: changedFields
    });

  } catch (error) {
    console.error('Admin PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update order. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin - Add manual WhatsApp order
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();

    // Validate required fields
    if (!body.customer_name?.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required.' },
        { status: 400 }
      );
    }

    const phone = String(body.phone || '').replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit WhatsApp number.' },
        { status: 400 }
      );
    }

    // Generate order ID
    const id = `DH-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // Create order record
    const orderRecord = {
      order_id: id,
      product_id: body.product_id || 'BRW-001',
      customer_name: body.customer_name.trim(),
      phone: phone,
      event_date: body.event_date,
      quantity: body.quantity,
      area: body.area || '',
      notes: body.notes || '',
      status: body.status || 'Request received',
      payment_status: body.payment_status || 'Not requested',
      source: 'WhatsApp'
    };

    const { error } = await supabaseAdmin.from('orders').insert(orderRecord);

    if (error) {
      console.error('Manual order insert error:', error);
      throw error;
    }

    // Log audit event
    await logAuditEvent({
      action: 'manual_order_created',
      entity_type: 'order',
      entity_id: id,
      new_value: orderRecord,
      ...createAuditContext(request)
    });

    return NextResponse.json({
      success: true,
      order_id: id,
      message: 'WhatsApp order added successfully.'
    });

  } catch (error) {
    console.error('Manual order error:', error);
    return NextResponse.json(
      { error: 'Failed to add WhatsApp order. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin - Delete order
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    // Fetch order for audit log
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    // Delete order
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Order delete error:', error);
      throw error;
    }

    // Log audit event
    await logAuditEvent({
      action: 'order_status_changed' as any, // Using existing action type
      entity_type: 'order',
      entity_id: order?.order_id || id,
      old_value: order,
      new_value: { deleted: true },
      ...createAuditContext(request)
    });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully.'
    });

  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order. Please try again.' },
      { status: 500 }
    );
  }
}
