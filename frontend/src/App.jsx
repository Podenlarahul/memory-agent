import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerChatPage from './pages/CustomerChatPage';
import CustomerTicketsPage from './pages/CustomerTicketsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerSettingsPage from './pages/CustomerSettingsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminCustomerDetailPage from './pages/AdminCustomerDetailPage';
import AdminConversationsPage from './pages/AdminConversationsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminKnowledgeBasePage from './pages/AdminKnowledgeBasePage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('supportmind_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // Stale session detection:
        // If user is marked admin but has a customer_id, or email contains 'admin' but role is 'customer', invalidate!
        if (
          (u.email && u.email.toLowerCase().includes('admin') && u.role !== 'admin') ||
          (u.role === 'admin' && u.customer_id)
        ) {
          localStorage.removeItem('supportmind_user');
          localStorage.removeItem('supportmind_token');
          api.setToken('');
          return null;
        }
        return u;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLoginSuccess = (user) => {
    // Strictly sanitize: Admin NEVER has a customer_id
    const sanitized = {
      ...user,
      customer_id: user.role === 'customer' ? user.customer_id : null
    };
    setCurrentUser(sanitized);
    localStorage.setItem('supportmind_user', JSON.stringify(sanitized));
  };

  const handleLogout = () => {
    api.setToken('');
    localStorage.removeItem('supportmind_user');
    localStorage.removeItem('supportmind_token');
    sessionStorage.clear();
    setCurrentUser(null);
  };


  // Helper route guards
  const renderCustomerRoute = (Component) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (currentUser.role !== 'customer') return <Navigate to="/admin/dashboard" replace />;
    return <Component currentUser={currentUser} onLogout={handleLogout} />;
  };

  const renderAdminRoute = (Component) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (currentUser.role !== 'admin') return <Navigate to="/customer/dashboard" replace />;
    return <Component currentUser={currentUser} onLogout={handleLogout} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        
        <Route
          path="/login"
          element={
            currentUser ? (
              currentUser.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/customer/dashboard" replace />
              )
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            currentUser ? (
              currentUser.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/customer/dashboard" replace />
              )
            ) : (
              <SignupPage onRegisterSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />

        {/* CUSTOMER ROUTES */}
        <Route
          path="/customer/dashboard"
          element={renderCustomerRoute(CustomerDashboard)}
        />
        <Route
          path="/customer/chat"
          element={renderCustomerRoute(CustomerChatPage)}
        />
        <Route
          path="/customer/chat/:conversationId"
          element={renderCustomerRoute(CustomerChatPage)}
        />
        <Route
          path="/customer/tickets"
          element={renderCustomerRoute(CustomerTicketsPage)}
        />
        <Route
          path="/customer/profile"
          element={renderCustomerRoute(CustomerProfilePage)}
        />
        <Route
          path="/customer/settings"
          element={renderCustomerRoute(CustomerSettingsPage)}
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={renderAdminRoute(AdminDashboard)}
        />
        <Route
          path="/admin/customers"
          element={renderAdminRoute(AdminCustomersPage)}
        />
        <Route
          path="/admin/customers/:customerId"
          element={renderAdminRoute(AdminCustomerDetailPage)}
        />
        <Route
          path="/admin/conversations"
          element={renderAdminRoute(AdminConversationsPage)}
        />
        <Route
          path="/admin/tickets"
          element={renderAdminRoute(AdminTicketsPage)}
        />
        <Route
          path="/admin/knowledge-base"
          element={renderAdminRoute(AdminKnowledgeBasePage)}
        />
        <Route
          path="/admin/analytics"
          element={renderAdminRoute(AdminAnalyticsPage)}
        />
        <Route
          path="/admin/settings"
          element={renderAdminRoute(AdminSettingsPage)}
        />
        <Route
          path="/admin/hindsight"
          element={renderAdminRoute(AdminSettingsPage)}
        />
        <Route
          path="/admin/ai-settings"
          element={renderAdminRoute(AdminSettingsPage)}
        />
        <Route
          path="/admin/users"
          element={renderAdminRoute(AdminCustomersPage)}
        />

        {/* FALLBACK / CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
