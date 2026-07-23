import { supabaseAdmin } from './supabase';

export type AuditAction = 
  | 'order_created'
  | 'order_status_changed'
  | 'order_payment_changed'
  | 'order_notes_updated'
  | 'order_schedule_updated'
  | 'order_customer_message_updated'
  | 'post_created'
  | 'post_updated'
  | 'post_deleted'
  | 'manual_order_created'
  | 'admin_login'
  | 'admin_logout';

export interface AuditLogEntry {
  action: AuditAction;
  entity_type: 'order' | 'post' | 'admin';
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      old_value: entry.old_value,
      new_value: entry.new_value,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      metadata: entry.metadata,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to log audit event:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Audit log error:', e);
    return false;
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Create audit context from request
 */
export function createAuditContext(request: Request) {
  return {
    ip_address: getClientIP(request),
    user_agent: getUserAgent(request)
  };
}
