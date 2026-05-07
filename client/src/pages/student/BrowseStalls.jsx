import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';

const BrowseStalls = () => {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await api.get('/stalls');
        setStalls(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStalls();
  }, []);

  return (
    <PageWrapper title="Food Court" subtitle="Discover what's cooking today">
      {loading ? (
        <div className="grid grid-cols-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : stalls.length === 0 ? (
        <EmptyState
          icon="🏪"
          title="No stalls open right now"
          subtitle="Check back later — stalls will appear here when they open."
        />
      ) : (
        <div className="grid grid-cols-3">
          {stalls.map((stall, i) => (
            <Link
              to={`/stalls/${stall.id}`}
              key={stall.id}
              className="glass-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                animation: `slideUp 0.4s ease-out ${i * 0.07}s both`
              }}
            >
              <div style={{
                height: '140px',
                background: stall.image_url
                  ? `linear-gradient(to bottom, transparent 40%, var(--surface-1)), url(${stall.image_url})`
                  : 'linear-gradient(135deg, var(--surface-2), var(--surface-3))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: stall.image_url ? '0' : '3rem',
              }}>
                {!stall.image_url && '🍽️'}
              </div>

              <div className="flex justify-between items-center">
                <h3>{stall.stall_name}</h3>
                <span className="badge badge-success">
                  <span className="pulse-dot" />
                  Open
                </span>
              </div>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                marginTop: '8px',
                lineHeight: 1.5
              }}>
                {stall.description || 'Delicious food served fresh'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default BrowseStalls;
