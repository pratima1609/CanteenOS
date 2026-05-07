import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';

const PickupScanner = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastVerified, setLastVerified] = useState(null);
  const [error, setError] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const res = await api.post('/stall/pickup/verify', { token: token.toUpperCase() });
      toast.success('Pickup Confirmed!');
      setLastVerified(res.data.subOrderId);
      setToken('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Token');
      setLastVerified(null);
      setError(true);
      setTimeout(() => setError(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', justifyContent: 'center', paddingTop: '8vh' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '0 24px' }}>
        <div className="glass-panel text-center" style={{ padding: '48px 36px' }}>
          {/* Scanner Visual */}
          <div style={{
            width: '80px', height: '80px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--amber-soft)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            📱
            <div style={{
              position: 'absolute',
              left: '10%', right: '10%',
              height: '2px',
              background: 'var(--amber)',
              borderRadius: '1px',
              boxShadow: '0 0 8px var(--amber-glow)',
              animation: 'scanLine 2s ease-in-out infinite',
            }} />
          </div>

          <h2 className="mb-2">Verify Pickup</h2>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Enter the 8-character token from the student's screen
          </p>

          <form onSubmit={handleVerify}>
            <input
              type="text"
              className="form-control mb-4"
              placeholder="e.g. 7A3FB9C2"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              style={{
                fontSize: '1.6rem',
                textAlign: 'center',
                letterSpacing: '6px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '16px',
                animation: error ? 'shake 0.4s ease' : 'none'
              }}
              maxLength={8}
              required
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || token.length < 8}
            >
              {loading ? 'Verifying…' : 'Verify & Complete'}
            </button>
          </form>

          {/* Success State */}
          {lastVerified && (
            <div className="mt-4" style={{
              background: 'var(--success-soft)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              animation: 'slideUp 0.3s ease-out both'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ margin: '0 auto 8px', display: 'block' }}>
                <circle cx="20" cy="20" r="18" fill="none" stroke="var(--success)" strokeWidth="2" opacity="0.3" />
                <circle cx="20" cy="20" r="18" fill="none" stroke="var(--success)" strokeWidth="2"
                  strokeDasharray="113" strokeDashoffset="0"
                  style={{ animation: 'fadeIn 0.5s ease-out' }}
                />
                <path d="M12 20l5 5l11-11" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="24" style={{ animation: 'checkDraw 0.4s 0.3s ease-out both' }}
                />
              </svg>
              <h4 style={{ color: 'var(--success)', marginBottom: '4px' }}>Pickup Confirmed</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Sub-order #{lastVerified} marked as picked up
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupScanner;
