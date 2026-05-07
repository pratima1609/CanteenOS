import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseStalls from './pages/student/BrowseStalls';
import StallMenu from './pages/student/StallMenu';
import Cart from './pages/student/Cart';
import OrderTracker from './pages/student/OrderTracker';
import MyOrders from './pages/student/MyOrders';
import StallDashboard from './pages/stall/StallDashboard';
import MenuManager from './pages/stall/MenuManager';
import StallQueue from './pages/stall/StallQueue';
import PickupScanner from './pages/stall/PickupScanner';
import StallHistory from './pages/stall/StallHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </>
  );
};

const DefaultRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/stalls" replace />;
  if (user.role === 'stall_owner') return <Navigate to="/stall/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<DefaultRedirect />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/stalls" element={<BrowseStalls />} />
        <Route path="/stalls/:id" element={<StallMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderTracker />} />
      </Route>

      {/* Stall Owner Routes */}
      <Route element={<ProtectedRoute roles={['stall_owner']} />}>
        <Route path="/stall/dashboard" element={<StallDashboard />} />
        <Route path="/stall/menu" element={<MenuManager />} />
        <Route path="/stall/queue" element={<StallQueue />} />
        <Route path="/stall/scanner" element={<PickupScanner />} />
        <Route path="/stall/history" element={<StallHistory />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '0.9rem',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              },
              success: {
                iconTheme: { primary: 'var(--success)', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: 'var(--danger)', secondary: '#fff' },
              }
            }}
          />
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
