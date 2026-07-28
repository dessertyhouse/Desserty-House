import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const AUTH_COOKIE_NAME = 'admin_session';
const AUTH_TOKEN_COOKIE_NAME = 'admin_token';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  authenticated: boolean;
  timestamp: number;
}

/**
 * Create admin auth client with service role
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Verify admin password and create session
 */
export async function authenticateAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const storedPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!storedPassword) {
    console.error('ADMIN_DASHBOARD_PASSWORD not configured');
    return { success: false, error: 'Server configuration error' };
  }

  if (password !== storedPassword) {
    return { success: false, error: 'Invalid password' };
  }

  // Create session token
  const session: AdminSession = {
    authenticated: true,
    timestamp: Date.now()
  };

  const sessionData = Buffer.from(JSON.stringify(session)).toString('base64');
  const token = Buffer.from(`${Date.now()}-${Math.random().toString(36).substring(2)}`).toString('base64');

  // Set cookies
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/'
  });
  cookieStore.set(AUTH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/'
  });

  return { success: true };
}

/**
 * Verify admin session from cookies
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;

    if (!sessionData || !token) {
      return false;
    }

    const session: AdminSession = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf-8'));

    if (!session.authenticated) {
      return false;
    }

    // Check if session is expired
    if (Date.now() - session.timestamp > SESSION_DURATION_MS) {
      await logoutAdmin();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Logout admin and clear cookies
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(AUTH_TOKEN_COOKIE_NAME);
}

/**
 * Get admin password from header (for API routes)
 * Deprecated: Use verifyAdminSession instead
 */
export function getAdminPasswordFromHeader(request: Request): string | null {
  return request.headers.get('x-admin-password');
}
