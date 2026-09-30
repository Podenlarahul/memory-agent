import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SettingsView from '../components/SettingsView';

export default function AdminSettingsPage({ currentUser, onLogout }) {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <SettingsView hindsightStatus={{ connected: true, bank_id: 'SupportMind' }} />
    </AdminLayout>
  );
}
