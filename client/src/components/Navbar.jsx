import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const navLinks = [];
  if (user?.role === 'student') {
    navLinks.push({ to: '/stalls', label: 'Stalls', icon: '🏪' });
    navLinks.push({ to: '/cart', label: `Cart${cartItemsCount > 0 ? ` (${cartItemsCount})` : ''}`, icon: '🛒' });
    navLinks.push({ to: '/orders', label: 'My Orders', icon: '📦' });
  } else if (user?.role === 'stall_owner') {
    navLinks.push({ to: '/stall/dashboard', label: 'Dashboard', icon: '📊' });
    navLinks.push({ to: '/stall/queue', label: 'Queue', icon: '🍳' });
    navLinks.push({ to: '/stall/menu', label: 'Menu', icon: '📋' });
    navLinks.push({ to: '/stall/scanner', label: 'Scanner', icon: '📱' });
    navLinks.push({ to: '/stall/history', label: 'History', icon: '📜' });
  } else if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Dashboard', icon: '⚙️' });
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="container nav-content">
        <Link to="/" className="logo">
          Canteen<span>OS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="flex items-center gap-3 hide-mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {user && (
            <>
              <div className="user-pill">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <span>{user.name}</span>
              </div>
              <button onClick={logout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="container" style={{ paddingBottom: '16px', borderTop: '1px solid var(--border)' }} id="mobile-drawer">
          <div className="flex flex-col gap-1 mt-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            {user && (
              <button onClick={logout} className="btn btn-danger btn-sm mt-2">
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          #mobile-menu-btn { display: inline-flex !important; }
          .hide-mobile { display: none !important; }
          #mobile-drawer { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
