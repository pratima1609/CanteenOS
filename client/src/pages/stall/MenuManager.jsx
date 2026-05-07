import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';

const MenuManager = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category_id: '', description: '', price: '', is_veg: true, is_available: true, prep_time_minutes: 5
  });

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get('/stall/menu'),
        api.get('/stall/categories')
      ]);
      setMenu(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stall/menu', formData);
      toast.success('Item added');
      setShowForm(false);
      setFormData({ name: '', category_id: '', description: '', price: '', is_veg: true, is_available: true, prep_time_minutes: 5 });
      fetchData();
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/stall/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Menu Manager">
        <div className="glass-panel text-center" style={{ padding: '48px' }}>
          <p className="text-muted">Loading menu…</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Menu Manager"
      subtitle={`${menu.length} item${menu.length !== 1 ? 's' : ''}`}
      actions={
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      }
    >
      {/* Add Item Form */}
      {showForm && (
        <div className="glass-panel mb-4" style={{ animation: 'slideUp 0.3s ease-out both' }}>
          <h3 className="mb-3">New Menu Item</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" placeholder="e.g. Masala Dosa" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select name="category_id" className="form-control" onChange={handleChange} required>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Price (₹)</label>
                <input type="number" name="price" className="form-control" placeholder="0" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prep Time (mins)</label>
                <input type="number" name="prep_time_minutes" value={formData.prep_time_minutes} className="form-control" onChange={handleChange} required />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 mb-3">
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" name="is_veg" checked={formData.is_veg} onChange={handleChange} />
                <span className={`veg-indicator ${formData.is_veg ? 'veg' : 'non-veg'}`} />
                Vegetarian
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} />
                Available Now
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full">Save Item</button>
          </form>
        </div>
      )}

      {/* Menu Table */}
      <div className="glass-panel">
        {menu.length === 0 ? (
          <div className="text-center" style={{ padding: '48px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
            <p className="text-muted">No menu items yet. Add your first item above.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td><span className="mono-price">₹{item.price}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`veg-indicator ${item.is_veg ? 'veg' : 'non-veg'}`} />
                      <span style={{ fontSize: '0.85rem' }}>{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                      {item.is_available ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
};

export default MenuManager;
