import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';

const StallHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/stall/history');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const totalRevenue = orders
    .filter(o => o.status === 'picked_up')
    .reduce((sum, o) => sum + (o.subtotal || 0), 0);

  const completedCount = orders.filter(o => o.status === 'picked_up').length;
  const rejectedCount = orders.filter(o => o.status === 'rejected' || o.status === 'cancelled').length;

  return (
    <PageWrapper title="Order History" subtitle="Past completed and cancelled orders">
      {/* Stats row */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 mb-4" style={{ gap: '12px' }}>
          <div className="stat-card" style={{ padding: '16px' }}>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>Revenue</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>₹{totalRevenue}</div>
          </div>
          <div className="stat-card" style={{ padding: '16px' }}>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>Completed</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--success)' }}>{completedCount}</div>
          </div>
          <div className="stat-card" style={{ padding: '16px' }}>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>Rejected</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--danger)' }}>{rejectedCount}</div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'picked_up', label: 'Completed' },
          { key: 'rejected', label: 'Rejected' },
        ].map(f => (
          <button
            key={f.key}
            className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel">
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <Skeleton variant="text" width="150px" height="16px" />
                <Skeleton variant="text" width="200px" style={{ marginTop: '6px' }} />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No orders yet"
          subtitle="Completed and cancelled orders will appear here."
        />
      ) : (
        <div className="glass-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Student</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td>
                    <span className="text-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {order.order_ref}
                    </span>
                  </td>
                  <td>{order.student_name}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {order.items?.map(item =>
                        `${item.quantity}× ${item.item_name_snapshot}`
                      ).join(', ')}
                    </div>
                  </td>
                  <td><span className="mono-price">₹{order.subtotal}</span></td>
                  <td><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
};

export default StallHistory;
