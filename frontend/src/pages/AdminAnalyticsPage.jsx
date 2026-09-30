import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AnalyticsView from '../components/AnalyticsView';

export default function AdminAnalyticsPage({ currentUser, onLogout }) {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <AnalyticsView />
    </AdminLayout>
  );
}
