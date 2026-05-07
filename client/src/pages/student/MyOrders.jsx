import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeStatuses = ['processing', 'received', 'accepted', 'preparing', 'ready'];
  const historyStatuses = ['complete', 'cancelled'];

  const activeOrders = orders.filter(o =>
    o.status === 'processing' || o.subOrders?.some(s => activeStatuses.includes(s.status))
  );
  const historyOrders = orders.filter(o =>
    historyStatuses.includes(o.status)
  );

  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getOverallStatus = (order) => {
    if (order.status === 'complete') return 'complete';
    if (order.status === 'cancelled') return 'cancelled';
    if (!order.subOrders || order.subOrders.length === 0) return order.status;
    if (order.subOrders.some(s => s.status === 'ready')) return 'ready';
    if (order.subOrders.some(s => s.status === 'preparing')) return 'preparing';
    if (order.subOrders.some(s => s.status === 'accepted')) return 'accepted';
    return 'received';
  };

  return (
    <PageWrapper title="My Orders">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setTab('active')}
        >
          Active
          {activeOrders.length > 0 && (
            <span style={{
              marginLeft: '6px',
              background: tab === 'active' ? 'rgba(255,255,255,0.2)' : 'var(--amber-soft)',
              color: tab === 'active' ? 'white' : 'var(--amber)',
              padding: '1px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel" style={{ padding: '20px' }}>
              <div className="flex justify-between mb-3">
                <Skeleton variant="text" width="120px" height="18px" />
                <Skeleton variant="text" width="80px" height="24px" />
              </div>
              <Skeleton variant="text" width="200px" />
              <Skeleton variant="text" width="150px" style={{ marginTop: '8px' }} />
            </div>
          ))}
        </div>
      ) : displayOrders.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? '🍽️' : '📜'}
          title={tab === 'active' ? 'No active orders' : 'No order history'}
          subtitle={tab === 'active'
            ? 'Place an order to see it tracked here in real-time.'
            : 'Your completed and cancelled orders will appear here.'
          }
          actionLabel={tab === 'active' ? 'Browse Stalls' : undefined}
          actionTo={tab === 'active' ? '/stalls' : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {displayOrders.map((order, i) => {
            const status = getOverallStatus(order);
            const stallNames = order.subOrders?.map(s => s.stall_name).filter(Boolean);
            const uniqueStalls = [...new Set(stallNames)];

            return (
              <Link
                to={`/orders/${order.id}`}
                key={order.id}
                className="glass-card no-hover"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  animation: `slideUp 0.3s ease-out ${i * 0.06}s both`,
                  display: 'block',
                  borderLeft: `3px solid ${
                    status === 'complete' ? 'var(--success)' :
                    status === 'cancelled' ? 'var(--danger)' :
                    status === 'ready' ? 'var(--success)' :
                    'var(--amber)'
                  }`,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                {/* Top row: Order ref + status */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {order.order_ref}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Stalls */}
                <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  {uniqueStalls.map(name => (
                    <span key={name} style={{
                      fontSize: '0.8rem',
                      padding: '2px 10px',
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                    }}>
                      {name}
                    </span>
                  ))}
                </div>

                {/* Bottom row: amount + sub-order count */}
                <div className="flex justify-between items-center">
                  <span className="mono-price" style={{ color: 'var(--amber)', fontSize: '1.05rem' }}>
                    ₹{order.total_amount}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {order.subOrders?.length || 0} sub-order{(order.subOrders?.length || 0) !== 1 ? 's' : ''}
                    {tab === 'active' && status === 'ready' && (
                      <span style={{ marginLeft: '8px', color: 'var(--success)', fontWeight: 600 }}>
                        Ready for pickup!
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

export default MyOrders;
