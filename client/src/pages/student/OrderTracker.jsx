import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import StatusBadge from '../../components/StatusBadge';

const statusSteps = ['received', 'accepted', 'preparing', 'ready', 'picked_up'];
const stepLabels = { received: 'Order Received', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready for Pickup', picked_up: 'Picked Up' };

const OrderTracker = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [queues, setQueues] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const pollAll = async () => {
      try {
        const orderRes = await api.get(`/orders/${id}`);
        const currentOrder = orderRes.data;
        setOrder(currentOrder);

        const newQueues = { ...queues };
        for (let sub of currentOrder.subOrders) {
          if (['picked_up', 'rejected', 'cancelled', 'ready'].includes(sub.status)) {
            delete newQueues[sub.stall_id];
            continue;
          }
          try {
            const qRes = await api.get(`/orders/${id}/queue/${sub.stall_id}`);
            newQueues[sub.stall_id] = qRes.data;
          } catch (e) {
            console.error(`Error polling queue for stall ${sub.stall_id}:`, e);
          }
        }
        setQueues(newQueues);
      } catch (err) {
        console.error('Error polling order details:', err);
      }
    };

    pollAll();
    const interval = setInterval(pollAll, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <PageWrapper title="Order Tracker">
        <div className="glass-panel text-center" style={{ padding: '64px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <p className="text-muted">Loading your order…</p>
        </div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper title="Order Tracker">
        <div className="glass-panel text-center" style={{ padding: '64px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔍</div>
          <p>Order not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Order ${order.order_ref}`}
      actions={<StatusBadge status={order.status} />}
    >
      <div className="grid grid-cols-2">
        {order.subOrders.map((sub, si) => {
          const qData = queues[sub.stall_id] || {};
          const currentStatus = qData.status || sub.status;
          const currentStepIdx = statusSteps.indexOf(currentStatus);

          return (
            <div key={sub.id} className="glass-panel" style={{ animation: `slideUp 0.4s ease-out ${si * 0.12}s both` }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ color: 'var(--amber)' }}>{sub.stall_name}</h3>
                <StatusBadge status={currentStatus} />
              </div>

              {/* Items */}
              <div style={{ background: 'var(--surface-0)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px' }}>
                {sub.items.map(item => (
                  <div key={item.id} className="flex justify-between" style={{ padding: '4px 0', fontSize: '0.9rem' }}>
                    <span>{item.quantity}× {item.item_name_snapshot}</span>
                    <span className="mono-price text-muted">₹{item.unit_price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Status Stepper */}
              <div className="stepper mb-4">
                {statusSteps.filter(s => s !== 'picked_up' || currentStatus === 'picked_up').map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  const isLast = idx === statusSteps.length - 1 || (step === 'ready' && currentStatus !== 'picked_up');

                  return (
                    <div key={step} className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      <div>
                        <div className="stepper-dot" />
                        {!isLast && <div className="stepper-line" />}
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--teal)' : 'var(--text-tertiary)'
                        }}>
                          {stepLabels[step]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pickup Token */}
              <div className="token-display">
                <div className="token-label">Pickup Token</div>
                <div className="token-value">{sub.pickup_token}</div>
              </div>

              {/* Queue Position */}
              {['accepted', 'preparing'].includes(currentStatus) && qData.queuePosition && (
                <div className="text-center mt-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '50%',
                    border: '3px solid var(--amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--amber)',
                  }}>
                    {qData.queuePosition - 1}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>orders ahead</div>
                  {qData.estimatedWaitMinutes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '4px', fontWeight: 600 }}>
                      ~{qData.estimatedWaitMinutes} min wait
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default OrderTracker;
