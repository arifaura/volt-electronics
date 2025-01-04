import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import ScrollToTop from './components/utils/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CouponProvider } from './context/CouponContext';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import Messages from './pages/admin/Messages';
import Dashboard from './pages/admin/Dashboard';

function App() {
  const { user, loading } = useAuth();

  // Root route handler component
  const RootRedirect = () => {
    if (loading) return null; // Show nothing while loading
    if (!user) return <Layout><Home /></Layout>;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Layout><Home /></Layout>;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CouponProvider>
            <ScrollToTop />
            <Routes>
              {/* Root route with role-based redirect */}
              <Route path="/" element={<RootRedirect />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Auth Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="messages" element={<Messages />} />
              </Route>

              {/* Customer Routes */}
              <Route path="/" element={<Layout />}>
                <Route path="products" element={<Products />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="contact" element={<Contact />} />
                <Route path="wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route 
                path="/orders/:orderId" 
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </CouponProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

// Wrap the App with AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth; 