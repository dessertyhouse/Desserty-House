'use client';

import { useState, useEffect, useCallback } from 'react';
import PostManager from './PostManager';

// Types
type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  phone: string;
  product_id: string;
  event_date: string;
  quantity: string;
  area: string;
  status: string;
  payment_status: string;
  scheduled_at?: string;
  admin_notes?: string;
  customer_message?: string;
  source?: string;
  notes?: string;
  created_at: string;
};

type AuthState = 'loading' | 'login' | 'authenticated' | 'error';

const ORDER_STATUSES = [
  'Request received',
  'Awaiting customer reply',
  'Quote sent',
  'Awaiting advance',
  'Confirmed',
  'In production',
  'Ready',
  'Out for delivery',
  'Completed',
  'Cancelled'
];

const PAYMENT_STATUSES = [
  'Not requested',
  'QR / UPI sent',
  'Advance received',
  'Paid in full',
  'Cash on delivery'
];

const PRODUCTS = ['BRW-001', 'BEN-001', 'FON-001', 'BOM-001', 'CUP-001', 'DON-001', 'BDY-001'];

export default function Admin() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter/sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'event_date' | 'created_at' | 'order_id'>('event_date');

  // UI state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual order form
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    phone: '',
    product_id: 'BRW-001',
    event_date: '',
    quantity: '',
    area: '',
    notes: '',
    status: 'Request received',
    payment_status: 'Not requested'
  });

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setAuthState(data.authenticated ? 'authenticated' : 'login');
      if (data.authenticated) {
        loadOrders();
      }
    } catch {
      setAuthState('login');
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        setAuthState('authenticated');
        loadOrders();
      } else {
        setAuthError(data.error || 'Invalid password');
      }
    } catch {
      setAuthError('Login failed. Please try again.');
    }

    setLoading(false);
  }

  async function logout() {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Ignore errors
    }
    setAuthState('login');
    setPassword('');
    setOrders([]);
  }

  async function loadOrders() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin');
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch {
      setError('Failed to load orders. Please try again.');
    }

    setLoading(false);
  }

  async function updateOrder(order: Order) {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Order updated successfully');
        loadOrders();
        setSelectedOrder(null);
      } else {
        showNotification('error', data.error || 'Failed to update order');
      }
    } catch {
      showNotification('error', 'Failed to update order');
    }
  }

  async function addManualOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm)
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', `WhatsApp order added: ${data.order_id}`);
        setShowManual(false);
        setManualForm({
          customer_name: '',
          phone: '',
          product_id: 'BRW-001',
          event_date: '',
          quantity: '',
          area: '',
          notes: '',
          status: 'Request received',
          payment_status: 'Not requested'
        });
        loadOrders();
      } else {
        showNotification('error', data.error || 'Failed to add order');
      }
    } catch {
      showNotification('error', 'Failed to add order');
    }

    setLoading(false);
  }

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (statusFilter !== 'All' && order.status !== statusFilter) return false;
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          order.order_id.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.phone.includes(search) ||
          order.product_id.toLowerCase().includes(searchLower) ||
          (order.area?.toLowerCase() || '').includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'event_date') {
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.order_id.localeCompare(b.order_id);
    });

  // Stats
  const stats = {
    open: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length,
    followUps: orders.filter(o => {
      if (!o.scheduled_at) return false;
      const today = new Date().toISOString().slice(0, 10);
      return o.scheduled_at.slice(0, 10) === today;
    }).length,
    paid: orders.filter(o => ['Advance received', 'Paid in full'].includes(o.payment_status)).length,
    total: orders.length
  };

  // Login screen
  if (authState === 'login') {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="login-header">
            <div className="brand-logo">Desserty House</div>
            <h1>Owner Dashboard</h1>
            <p className="muted">Enter your dashboard password to continue</p>
          </div>

          <form onSubmit={login} className="login-form">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </label>

            {authError && <div className="login-error">{authError}</div>}

            <button type="submit" className="btn gold login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" target="_blank">View website →</a>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="admin-loading">
        <div className="spinner large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Main admin dashboard
  return (
    <div className="admin-dashboard">
      {/* Notification */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="brand-logo">Desserty House</div>
          <span className="header-badge">Owner Dashboard</span>
        </div>
        <div className="admin-header-right">
          <button className="btn" onClick={loadOrders} disabled={loading}>
            {loading ? '↻' : '↻'} Refresh
          </button>
          <a className="btn" href="/" target="_blank">View website →</a>
          <button className="btn logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Open Orders</span>
            <span className="stat-value">{stats.open}</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-label">Follow-ups Today</span>
            <span className="stat-value">{stats.followUps}</span>
          </div>
          <div className="stat-card success">
            <span className="stat-label">Payments Received</span>
            <span className="stat-value">{stats.paid}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="toolbar-left">
            <input
              type="text"
              placeholder="Search orders, name, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="event_date">Sort by Date</option>
              <option value="created_at">Sort by Created</option>
              <option value="order_id">Sort by Order ID</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="btn" onClick={() => setShowManual(!showManual)}>
              + Add WhatsApp Order
            </button>
            <button className="btn gold" onClick={() => setShowPosts(!showPosts)}>
              {showPosts ? 'Hide' : 'Manage'} Posts
            </button>
          </div>
        </div>

        {/* Posts Manager */}
        {showPosts && (
          <section className="admin-section">
            <PostManager />
          </section>
        )}

        {/* Manual Order Form */}
        {showManual && (
          <section className="admin-section manual-order-section">
            <div className="section-header">
              <h2>Add WhatsApp Order</h2>
              <button className="btn close-btn" onClick={() => setShowManual(false)}>×</button>
            </div>
            <p className="muted">Log a conversation received directly on WhatsApp so every job appears in one production list.</p>
            
            <form onSubmit={addManualOrder} className="manual-form">
              <div className="form-row">
                <label>
                  Customer name *
                  <input
                    type="text"
                    required
                    value={manualForm.customer_name}
                    onChange={e => setManualForm({ ...manualForm, customer_name: e.target.value })}
                  />
                </label>
                <label>
                  WhatsApp number *
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={manualForm.phone}
                    onChange={e => setManualForm({ ...manualForm, phone: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Product ID *
                  <select
                    required
                    value={manualForm.product_id}
                    onChange={e => setManualForm({ ...manualForm, product_id: e.target.value })}
                  >
                    {PRODUCTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Required date *
                  <input
                    type="date"
                    required
                    value={manualForm.event_date}
                    onChange={e => setManualForm({ ...manualForm, event_date: e.target.value })}
                  />
                </label>
                <label>
                  Quantity *
                  <input
                    type="text"
                    required
                    placeholder="e.g., 1 kg, 12 pieces"
                    value={manualForm.quantity}
                    onChange={e => setManualForm({ ...manualForm, quantity: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Chennai area
                  <input
                    type="text"
                    placeholder="Locality"
                    value={manualForm.area}
                    onChange={e => setManualForm({ ...manualForm, area: e.target.value })}
                  />
                </label>
                <label>
                  Initial status
                  <select
                    value={manualForm.status}
                    onChange={e => setManualForm({ ...manualForm, status: e.target.value })}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Order notes
                <textarea
                  placeholder="Customer request details..."
                  value={manualForm.notes}
                  onChange={e => setManualForm({ ...manualForm, notes: e.target.value })}
                />
              </label>
              <button type="submit" className="btn gold" disabled={loading}>
                {loading ? 'Saving...' : 'Save WhatsApp Order'}
              </button>
            </form>
          </section>
        )}

        {/* Orders List */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Orders ({filteredOrders.length})</h2>
            {error && <span className="error-text">{error}</span>}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <span className="order-id">{order.order_id}</span>
                    <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <p className="customer-name">{order.customer_name}</p>
                    <p className="order-details">
                      <span>{order.product_id}</span>
                      <span>·</span>
                      <span>{order.quantity}</span>
                      <span>·</span>
                      <span>{order.event_date}</span>
                    </p>
                    <p className="payment-status">
                      Payment: <strong>{order.payment_status}</strong>
                    </p>
                  </div>
                  <div className="order-card-footer">
                    <a
                      href={`https://wa.me/91${order.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-link"
                      onClick={e => e.stopPropagation()}
                    >
                      WhatsApp →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedOrder.order_id}</h2>
                  <span className="product-badge">{selectedOrder.product_id}</span>
                </div>
                <button className="btn close-btn" onClick={() => setSelectedOrder(null)}>×</button>
              </div>

              <div className="modal-body">
                <div className="customer-section">
                  <h3>Customer</h3>
                  <p><strong>{selectedOrder.customer_name}</strong></p>
                  <p>
                    <a href={`https://wa.me/91${selectedOrder.phone}`} target="_blank" rel="noopener noreferrer">
                      {selectedOrder.phone} (WhatsApp)
                    </a>
                  </p>
                  <p>{selectedOrder.area || 'Area not specified'}</p>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <label>Required Date</label>
                    <span>{selectedOrder.event_date}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quantity</label>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <label>Source</label>
                    <span>{selectedOrder.source || 'Website'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="notes-section">
                    <h3>Customer Request</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}

                <OrderEditForm
                  order={selectedOrder}
                  onSave={updateOrder}
                  onCancel={() => setSelectedOrder(null)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Order Edit Form Component
function OrderEditForm({
  order,
  onSave,
  onCancel
}: {
  order: Order;
  onSave: (order: Order) => void;
  onCancel: () => void;
}) {
  const [editedOrder, setEditedOrder] = useState(order);
  const [saving, setSaving] = useState(false);

  const hasChanges = JSON.stringify(editedOrder) !== JSON.stringify(order);

  async function handleSave() {
    setSaving(true);
    await onSave(editedOrder);
    setSaving(false);
  }

  return (
    <div className="order-edit-form">
      <h3>Update Order</h3>

      <label>
        Workflow Status
        <select
          value={editedOrder.status}
          onChange={e => setEditedOrder({ ...editedOrder, status: e.target.value })}
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Payment Status
        <select
          value={editedOrder.payment_status}
          onChange={e => setEditedOrder({ ...editedOrder, payment_status: e.target.value })}
        >
          {PAYMENT_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Follow-up / Production Schedule
        <input
          type="datetime-local"
          value={editedOrder.scheduled_at?.slice(0, 16) || ''}
          onChange={e => setEditedOrder({
            ...editedOrder,
            scheduled_at: e.target.value || undefined
          })}
        />
      </label>

      <label>
        Customer-Visible Update
        <textarea
          placeholder="Message shown to customer on order tracking page..."
          value={editedOrder.customer_message || ''}
          onChange={e => setEditedOrder({
            ...editedOrder,
            customer_message: e.target.value
          })}
        />
      </label>

      <label>
        Private Admin Notes
        <textarea
          placeholder="Internal notes (not visible to customer)..."
          value={editedOrder.admin_notes || ''}
          onChange={e => setEditedOrder({
            ...editedOrder,
            admin_notes: e.target.value
          })}
        />
      </label>

      <div className="form-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button
          className="btn gold"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
