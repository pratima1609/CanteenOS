import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CartContext } from '../../context/CartContext';
import PageWrapper from '../../components/PageWrapper';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { toast } from 'react-hot-toast';

const StallMenu = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useContext(CartContext);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/stalls/${id}/menu`);
        setMenu(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  const handleAdd = async (itemId) => {
    await addToCart(itemId);
  };

  if (loading) {
    return (
      <PageWrapper title="Menu" actions={<Link to="/stalls" className="btn btn-ghost btn-sm">← Back</Link>}>
        <div className="grid grid-cols-2">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
      </PageWrapper>
    );
  }

  const categories = Object.keys(menu);

  return (
    <PageWrapper
      title="Menu"
      actions={<Link to="/stalls" className="btn btn-ghost btn-sm">← Back to Stalls</Link>}
    >
      {categories.length === 0 ? (
        <EmptyState icon="📋" title="Menu is empty" subtitle="This stall hasn't added any items yet." actionLabel="Browse other stalls" actionTo="/stalls" />
      ) : (
        <>
          {categories.map((category, ci) => (
            <div key={category} className="mb-6" style={{ animation: `slideUp 0.4s ease-out ${ci * 0.1}s both` }}>
              <div className="section-title">{category}</div>
              <div className="grid grid-cols-2">
                {menu[category].map(item => (
                  <div key={item.id} className="glass-card no-hover flex justify-between items-center" style={{ gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`veg-indicator ${item.is_veg ? 'veg' : 'non-veg'}`} />
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                      </div>
                      {item.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 8px', lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      )}
                      <div className="mono-price" style={{ color: 'var(--amber)', fontSize: '1.05rem' }}>
                        ₹{item.price}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      Add +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {cartItemsCount > 0 && (
        <Link to="/cart" className="floating-bar" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.2rem' }}>🛒</span>
          <span style={{ fontWeight: 600 }}>{cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} in cart</span>
          <span className="btn btn-primary btn-sm" style={{ marginLeft: '8px' }}>View Cart →</span>
        </Link>
      )}
    </PageWrapper>
  );
};

export default StallMenu;
