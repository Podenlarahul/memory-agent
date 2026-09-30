import React from 'react';
import AdminLayout from '../components/AdminLayout';
import KnowledgeBaseView from '../components/KnowledgeBaseView';

export default function AdminKnowledgeBasePage({ currentUser, onLogout }) {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <KnowledgeBaseView />
    </AdminLayout>
  );
}
