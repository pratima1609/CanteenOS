import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CartContext } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';
import EmptyState from '../../components/EmptyState';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  if (cart.length === 0) {
    return (
      <PageWrapper title="Your Cart">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Browse stalls and add some delicious items to get started."
          actionLabel="Browse Stalls"
          actionTo="/stalls"
        />
      </PageWrapper>
    );
  }

  const cartByStall = cart.reduce((acc, item) => {
    if (!acc[item.stall_name]) acc[item.stall_name] = [];
    acc[item.stall_name].push(item);
    return acc;
  }, {});

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post('/orders/checkout');
      toast.success('Order placed!');
      fetchCart();
      navigate(`/orders/${res.data.masterId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <PageWrapper title="Your Cart" subtitle={`${cart.length} item${cart.length > 1 ? 's' : ''} from ${Object.keys(cartByStall).length} stall${Object.keys(cartByStall).length > 1 ? 's' : ''}`}>
      <div className="grid grid-cols-2 responsive-1" style={{ gap: '32px', alignItems: 'start' }}>
        {/* Cart Items */}
        <div className="flex flex-col gap-4">
          {Object.entries(cartByStall).map(([stallName, items], si) => (
            <div key={stallName} className="glass-panel" style={{ animation: `slideUp 0.4s ease-out ${si * 0.1}s both` }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏪</span> {stallName}
              </div>

              {items.map(item => (
                <div key={item.cart_item_id} className="flex justify-between items-center" style={{
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>{item.name}</div>
                    <div className="mono-price text-muted" style={{ fontSize: '0.85rem' }}>₹{item.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-secondary btn-icon btn-sm" onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)} style={{ width: '32px', height: '32px', padding: 0 }}>−</button>
                    <span style={{ fontWeight: 700, width: '24px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>{item.quantity}</span>
                    <button className="btn btn-secondary btn-icon btn-sm" onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)} style={{ width: '32px', height: '32px', padding: 0 }}>+</button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeFromCart(item.cart_item_id)} style={{ color: 'var(--danger)', width: '32px', height: '32px', padding: 0 }}>✕</button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-3" style={{ fontWeight: 600 }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Subtotal</span>
                <span className="mono-price">₹{items.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: '88px' }}>
          <div className="glass-panel" style={{ animation: 'slideInRight 0.4s ease-out both' }}>
            <h3 className="mb-4">Order Summary</h3>

            {Object.entries(cartByStall).map(([stallName, items]) => (
              <div key={stallName} className="flex justify-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span className="text-muted">{stallName}</span>
                <span className="mono-price">₹{items.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
              </div>
            ))}

            <div className="divider" />

            <div className="flex justify-between items-center mb-4" style={{ fontSize: '1.2rem' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span className="mono-price" style={{ color: 'var(--amber)', fontSize: '1.4rem' }}>₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing…' : 'Pay & Split Order →'}
            </button>

            <p className="text-center mt-3" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Your order will be split into sub-orders for each stall
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Cart;
