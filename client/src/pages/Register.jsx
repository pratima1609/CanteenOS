import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', stall_name: '', fssai_number: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            Canteen<span style={{ color: 'var(--amber)' }}>OS</span>
          </div>
          <p className="auth-subtitle">Create your account</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 mb-4" style={{ gap: '12px' }}>
          {[
            { value: 'student', icon: '🎓', label: 'Student', desc: 'Order food from stalls' },
            { value: 'stall_owner', icon: '🍳', label: 'Stall Owner', desc: 'Manage your food stall' }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              className={`glass-card no-hover text-center`}
              onClick={() => setFormData({ ...formData, role: option.value })}
              style={{
                cursor: 'pointer',
                borderColor: formData.role === option.value ? 'var(--amber)' : 'var(--border)',
                background: formData.role === option.value ? 'var(--amber-soft)' : 'var(--surface-2)',
                transition: 'all 0.2s',
                padding: '16px 12px'
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{option.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{option.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{option.desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" name="name" className="form-control" placeholder="Your name" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" name="email" className="form-control" placeholder="you@example.com" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" name="password" className="form-control" placeholder="Min 6 characters" minLength="6" onChange={handleChange} required />
          </div>

          {formData.role === 'stall_owner' && (
            <div className="glass-card no-hover mb-4" style={{ background: 'var(--surface-0)', animation: 'slideUp 0.3s ease-out' }}>
              <h4 className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏪</span> Stall Details
              </h4>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-stall">Stall Name</label>
                <input id="reg-stall" type="text" name="stall_name" className="form-control" placeholder="e.g. Biryani House" onChange={handleChange} required={formData.role === 'stall_owner'} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reg-fssai">FSSAI Number</label>
                <input id="reg-fssai" type="text" name="fssai_number" className="form-control" placeholder="e.g. 123456" onChange={handleChange} required={formData.role === 'stall_owner'} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
