import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Loader2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';

export default function AdminTicketsPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets();
      setTickets(data || []);
    } catch (e) {
      console.warn('Failed to load tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ticketId, currentStatus) => {
    const isResolved = currentStatus?.toLowerCase() === 'resolved' || currentStatus?.toLowerCase() === 'closed';
    const newStatus = isResolved ? 'open' : 'resolved';
    try {
      setUpdatingId(ticketId);
      await api.updateTicketStatus(ticketId, newStatus);
      // Immediately reflect in state
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: isResolved ? 'Open' : 'Resolved' };
        }
        return t;
      }));
    } catch (e) {
      alert('Failed to update ticket status: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'open' ? t.status?.toLowerCase() === 'open' :
      activeTab === 'resolved' ? (t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed') :
      true;

    const matchesSearch = 
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.context?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tickets Management</h2>
          <p className="text-xs text-slate-500">Monitor issue statuses, severities, and customer escalation threads ({tickets.length} total)</p>
        </div>

        <button
          onClick={loadTickets}
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto shadow-2xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'open' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open ({tickets.filter(t => t.status?.toLowerCase() === 'open').length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'resolved' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({tickets.filter(t => t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, title..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading ticket queue...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No tickets found</h4>
              <p className="text-xs text-slate-500">No tickets match your query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Subject & Context</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((t, idx) => {
                  const isResolved = t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed';
                  const isUpdating = updatingId === t.id;

                  return (
                    <tr key={t.id || `tkt-${t.customer_id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-500 text-[11px]">{t.id}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/admin/customers/${t.customer_id}`)}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{t.customer_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div className="font-bold text-slate-900">{t.subject}</div>
                        {t.context && <div className="text-[11px] text-slate-400 truncate">{t.context}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.priority?.toLowerCase() === 'urgent' || t.priority?.toLowerCase() === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isResolved 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-slate-400 whitespace-nowrap">
                        {t.created_at || 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(t.id, t.status)}
                          disabled={isUpdating}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5 ${
                            isResolved
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isResolved ? (
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>{isResolved ? 'Reopen' : 'Resolve'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
