import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [stalls, setStalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState({ totalGmv: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('approvals');

  const fetchData = async () => {
    try {
      const [stallsRes, statsRes, catRes] = await Promise.all([
        api.get('/admin/stalls'),
        api.get('/admin/analytics'),
        api.get('/admin/categories')
      ]);
      setStalls(stallsRes.data);
      setAnalytics(statsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStall = async (id, action) => {
    try {
      await api.put(`/admin/stalls/${id}/${action}`);
      toast.success(`Stall ${action}ed`);
      fetchData();
    } catch (err) {
      toast.error(`Failed to ${action} stall`);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCategoryName });
      toast.success('Category added');
      setNewCategoryName('');
      fetchData();
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Admin Dashboard">
        <div className="glass-panel text-center" style={{ padding: '48px' }}>
          <p className="text-muted">Loading dashboard…</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Admin Dashboard" subtitle="Platform overview and management">
      {/* Stats */}
      <div className="grid grid-cols-2 mb-6" style={{ gap: '16px' }}>
        <div className="stat-card" style={{ animation: 'slideUp 0.4s ease-out both' }}>
          <div className="stat-label">Platform GMV</div>
          <div className="stat-value">₹{analytics.totalGmv || 0}</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.4s ease-out 0.1s both' }}>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{analytics.totalOrders || 0}</div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'approvals', label: 'Stall Approvals', count: stalls.filter(s => s.approval_status === 'pending').length },
          { key: 'categories', label: 'Categories', count: categories.length },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                marginLeft: '6px',
                background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="glass-panel" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {stalls.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '48px' }}>No stalls registered yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stall</th>
                  <th>Owner</th>
                  <th>FSSAI</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stalls.map(stall => (
                  <tr key={stall.id}>
                    <td style={{ fontWeight: 600 }}>{stall.stall_name}</td>
                    <td>
                      <div>{stall.owner_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{stall.email}</div>
                    </td>
                    <td><span className="text-mono" style={{ fontSize: '0.85rem' }}>{stall.fssai_number}</span></td>
                    <td><StatusBadge status={stall.approval_status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end" style={{ justifyContent: 'flex-end' }}>
                        {stall.approval_status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => updateStall(stall.id, 'approve')}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStall(stall.id, 'reject')}>Reject</button>
                          </>
                        )}
                        {stall.approval_status === 'approved' && (
                          <button className="btn btn-danger btn-sm" onClick={() => updateStall(stall.id, 'suspend')}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="glass-panel" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <form onSubmit={handleAddCategory} className="flex gap-3 mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="New category name…"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <div key={cat.id} className="badge badge-secondary" style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-full)',
              }}>
                {cat.name}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>No categories added yet.</p>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default AdminDashboard;
