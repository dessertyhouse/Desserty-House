import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, verifyAdminSession, logoutAdmin } from '@/lib/auth';

/**
 * POST /api/admin/auth - Admin login
 */
export async function POST(request: NextRequest) {
  try {
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
