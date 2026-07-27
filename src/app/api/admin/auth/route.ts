import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, verifyAdminSession, logoutAdmin } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

/**
 * POST /api/admin/auth - Admin login
 * Rate limited: 5 attempts per minute per IP
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting on login attempts
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, {
      windowMs: 60000,
      maxRequests: 5
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const result = await authenticateAdmin(password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    // Log successful login
    await logAuditEvent({
      action: 'admin_login',
      entity_type: 'admin',
      ...createAuditContext(request),
      metadata: { success: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth - Check authentication status
 */
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession();

    return NextResponse.json({
      authenticated: isAuthenticated
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Unable to verify session.'
    });
  }
}

/**
 * DELETE /api/admin/auth - Logout
 */
export async function DELETE(request: NextRequest) {
  try {
    // Log logout action
    await logAuditEvent({
      action: 'admin_logout',
      entity_type: 'admin',
      ...createAuditContext(request)
    });

    await logoutAdmin();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    );
  }
}
