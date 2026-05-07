import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';

const StallDashboard = () => {
  const { user, stallProfile } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(stallProfile?.is_open === 1);

  const toggleStatus = async () => {
    try {
      await api.patch('/stall/status', { is_open: !isOpen });
      setIsOpen(!isOpen);
      toast.success(`Stall is now ${!isOpen ? 'Open' : 'Closed'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (!stallProfile) {
    return (
      <PageWrapper>
        <div className="glass-panel text-center" style={{ padding: '64px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <h2 className="mb-2">Awaiting Approval</h2>
          <p className="text-muted">Your stall application is currently pending admin review.</p>
        </div>
      </PageWrapper>
    );
  }

  const dashboardCards = [
    { to: '/stall/queue', icon: '🍳', title: 'Order Queue', desc: 'Manage incoming orders', color: 'var(--amber)' },
    { to: '/stall/menu', icon: '📋', title: 'Menu Manager', desc: 'Update items & prices', color: 'var(--teal)' },
    { to: '/stall/scanner', icon: '📱', title: 'Pickup Scanner', desc: 'Verify pickup tokens', color: 'var(--success)' },
    { to: '/stall/history', icon: '📜', title: 'Order History', desc: 'Past orders & revenue', color: 'var(--text-secondary)' },
  ];

  return (
    <PageWrapper
      title={stallProfile.stall_name}
      subtitle="Stall Dashboard"
      actions={
        <div className="flex items-center gap-3">
          <span style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: isOpen ? 'var(--success)' : 'var(--danger)'
          }}>
            {isOpen ? '● Open' : '● Closed'}
          </span>
          <label className="toggle-switch">
            <input type="checkbox" checked={isOpen} onChange={toggleStatus} />
            <div className="toggle-track" />
          </label>
        </div>
      }
    >
      <div className="grid grid-cols-3">
        {dashboardCards.map((card, i) => (
          <Link
            to={card.to}
            key={card.to}
            className="glass-card text-center"
            style={{
              padding: '40px 24px',
              textDecoration: 'none',
              color: 'inherit',
              animation: `slideUp 0.4s ease-out ${i * 0.1}s both`
            }}
          >
            <div style={{
              width: '64px', height: '64px',
              borderRadius: 'var(--radius-md)',
              background: `${card.color}15`,
              border: `1px solid ${card.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 20px'
            }}>
              {card.icon}
            </div>
            <h3 className="mb-2">{card.title}</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>{card.desc}</p>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
};

export default StallDashboard;
