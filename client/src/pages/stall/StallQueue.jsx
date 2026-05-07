import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';

const StallQueue = () => {
  const [subOrders, setSubOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/stall/sub-orders');
      setSubOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/stall/sub-orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
      fetchQueue();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Live Order Queue">
        <div className="glass-panel text-center" style={{ padding: '48px' }}>
          <p className="text-muted">Loading queue…</p>
        </div>
      </PageWrapper>
    );
  }

  const columns = [
    { key: 'received', label: 'Received', color: 'var(--warning)' },
    { key: 'accepted', label: 'Accepted', color: 'var(--amber)' },
    { key: 'preparing', label: 'Preparing', color: 'var(--teal)' },
    { key: 'ready', label: 'Ready', color: 'var(--success)' },
  ];

  return (
    <PageWrapper title="Live Order Queue" subtitle="Drag orders through your workflow">
      <div className="kanban-board">
        {columns.map(col => {
          const colOrders = subOrders.filter(o => o.status === col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  {col.label}
                </h3>
                <span className="kanban-count">{colOrders.length}</span>
              </div>

              <div className="kanban-items">
                {colOrders.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: '24px', fontSize: '0.85rem' }}>
                    No orders
                  </div>
                )}
                {colOrders.map(order => (
                  <div key={order.id} className={`kanban-card status-${col.key}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.order_ref}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Q:{order.queue_number || '-'}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {order.student_name}
                    </div>

                    <div style={{
                      background: 'var(--surface-0)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      marginBottom: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between" style={{ padding: '2px 0' }}>
                          <span>{item.quantity}× {item.item_name_snapshot}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {col.key === 'received' && (
                        <>
                          <button className="btn btn-primary btn-sm flex-1" onClick={() => updateStatus(order.id, 'accepted')}>✓ Accept</button>
                          <button className="btn btn-danger btn-sm flex-1" onClick={() => updateStatus(order.id, 'rejected')}>✕ Reject</button>
                        </>
                      )}
                      {col.key === 'accepted' && (
                        <button className="btn btn-primary btn-sm flex-1" onClick={() => updateStatus(order.id, 'preparing')}>🍳 Start Prep</button>
                      )}
                      {col.key === 'preparing' && (
                        <button className="btn btn-success btn-sm flex-1" onClick={() => updateStatus(order.id, 'ready')}>✓ Mark Ready</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default StallQueue;
