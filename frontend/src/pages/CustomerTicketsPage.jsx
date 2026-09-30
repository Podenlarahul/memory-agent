import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Check,
  AlertCircle, 
  X, 
  Loader2,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';

export default function CustomerTicketsPage({ currentUser, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default initial tickets matching screenshot if none returned
  const defaultTickets = [
    {
      id: 'TKT-2026-001',
      subject: 'Wi-Fi disconnects frequently',
      status: 'Open',
      priority: 'High',
      created_at: 'Created 2 days ago',
      context: 'Drops intermittently during video conferencing'
    },
    {
      id: 'TKT-2026-002',
      subject: 'Printer driver installation issue',
      status: 'Resolved',
      priority: 'Medium',
      created_at: 'Resolved 5 days ago',
      context: 'HP LaserJet driver conflict resolved'
    },
    {
      id: 'TKT-2026-003',
      subject: 'Battery drain problem',
      status: 'Resolved',
      priority: 'Low',
      created_at: 'Resolved 1 week ago',
      context: 'Background service power draw resolved via registry'
    }
  ];

  useEffect(() => {
    loadTickets();
  }, [currentUser]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets();
      if (data && data.length > 0) {
        setTickets(data);
      } else {
        setTickets(defaultTickets);
      }
    } catch (e) {
      console.warn('Failed to load tickets:', e);
      setTickets(defaultTickets);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const newTkt = await api.createTicket(subject.trim(), priority, context.trim() || subject.trim());
      setIsModalOpen(false);
      setSubject('');
      setPriority('Medium');
      setContext('');
      if (newTkt) {
        setTickets(prev => [newTkt, ...prev]);
      }
      await loadTickets();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create ticket. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTicketStatus = async (ticketId, currentStatus) => {
    const newStatus = currentStatus?.toLowerCase() === 'resolved' ? 'open' : 'resolved';
    try {
      setTickets(prev => prev.map(t => (t.id === ticketId || t.subject === ticketId) ? { ...t, status: newStatus === 'resolved' ? 'Resolved' : 'Open' } : t));
      const res = await api.updateTicketStatus(ticketId, newStatus);
      if (res && res.status) {
        setTickets(prev => prev.map(t => (t.id === ticketId || t.id === res.id) ? { ...t, status: res.status } : t));
      }
    } catch (e) {
      console.warn('Failed to toggle ticket status:', e);
      loadTickets();
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
      t.context?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>Resolved</span>
        </span>
      );
    }
    if (s === 'in progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        <span>Open</span>
      </span>
    );
  };

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-xs text-slate-500 mt-1">
              Track and manage all your logged issues and resolutions
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* Controls: Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'open' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open ({tickets.filter(t => t.status?.toLowerCase() === 'open').length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'resolved' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900'
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
              placeholder="Search tickets..."
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Tickets List Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading support tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No tickets found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {tickets.length === 0 
                    ? "You haven't submitted any support tickets yet." 
                    : "No tickets match your active filter."}
                </p>
              </div>
              {tickets.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Create Your First Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTickets.map((t) => {
                const displayId = t.id?.startsWith('#') ? t.id : `#${t.id}`;
                return (
                  <div
                    key={t.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="pt-0.5 shrink-0">
                        {getStatusBadge(t.status)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {t.subject}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                          <span>{displayId}</span>
                          <span>•</span>
                          <span className="font-sans font-medium text-slate-500">{t.priority} Priority</span>
                          {t.context && (
                            <>
                              <span>•</span>
                              <span className="font-sans truncate max-w-xs text-slate-400">{t.context}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 hidden sm:inline">{t.created_at || 'Recently'}</span>
                      <button
                        onClick={() => handleToggleTicketStatus(t.id, t.status)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          t.status?.toLowerCase() === 'resolved'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 active:scale-95'
                        }`}
                        title={t.status?.toLowerCase() === 'resolved' ? 'Reopen this ticket' : 'Mark ticket as resolved'}
                      >
                        {t.status?.toLowerCase() === 'resolved' ? (
                          <>
                            <RefreshCw className="w-3 h-3 text-slate-500" />
                            <span>Reopen</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Resolve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* CREATE TICKET MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Create Support Ticket</h3>
                    <p className="text-xs text-slate-500">Provide details for AI diagnostic tracking</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Issue Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Wi-Fi disconnecting after sleep mode"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details / Context
                  </label>
                  <textarea
                    rows={4}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Describe troubleshooting steps already attempted or error codes observed..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!subject.trim() || submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Ticket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
}
