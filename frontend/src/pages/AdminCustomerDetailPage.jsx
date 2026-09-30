import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Laptop, 
  Building, 
  Mail, 
  Ticket, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Database, 
  Loader2,
  Tag,
  RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';

export default function AdminCustomerDetailPage({ currentUser, onLogout }) {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [memoryView, setMemoryView] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('memories'); // 'memories' | 'overview' | 'tickets' | 'conversations'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const [cust, mems, convs, tkts] = await Promise.all([
        api.getCustomer(customerId).catch(() => null),
        api.getCustomerMemories(customerId).catch(() => null),
        api.getCustomerConversations(customerId).catch(() => []),
        api.getTickets().catch(() => [])
      ]);
      setCustomer(cust);
      setMemoryView(mems);
      setConversations(convs || []);
      setTickets((tkts || []).filter(t => t.customer_id === customerId));
    } catch (e) {
      console.warn('Failed to load customer detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMemories = async () => {
    try {
      setRefreshing(true);
      const mems = await api.getCustomerMemories(customerId);
      setMemoryView(mems);
    } catch (e) {
      alert('Error refreshing memories: ' + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleTicketStatus = async (ticketId, currentStatus) => {
    const isResolved = currentStatus?.toLowerCase() === 'resolved' || currentStatus?.toLowerCase() === 'closed';
    const newStatus = isResolved ? 'open' : 'resolved';
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: isResolved ? 'Open' : 'Resolved' };
        }
        return t;
      }));
    } catch (e) {
      alert('Failed to update ticket status: ' + e.message);
    }
  };

  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/customers')}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>{customer?.name || 'Customer Details'}</span>
              <span className="text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                Bank: {memoryView?.bank_id || `SupportMind-${customerId}`}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">{customer?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshMemories}
            disabled={refreshing}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Hindsight Bank</span>
          </button>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bank Isolated</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Customer Header Info Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {customer?.name ? customer.name.slice(0, 2).toUpperCase() : 'CU'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{customer?.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer?.device || 'Device not specified'}</span>
                  </span>

                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer?.company || 'Personal'}</span>
                  </span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold">{customer?.plan || 'Premium Support'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
              <div className="px-3 text-center border-r border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Memories</div>
                <div className="text-base font-extrabold text-purple-600">
                  {memoryView?.total_memories || 0}
                </div>
              </div>
              <div className="px-3 text-center border-r border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Tickets</div>
                <div className="text-base font-extrabold text-slate-800">
                  {tickets.length}
                </div>
              </div>
              <div className="px-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Sessions</div>
                <div className="text-base font-extrabold text-blue-600">
                  {conversations.length}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-t border-slate-100 pt-4 mt-5">
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'memories' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              <span>Hindsight Memories ({memoryView?.total_memories || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Troubleshooting
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'tickets' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-blue-600" />
              <span>Tickets ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'conversations' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Conversations ({conversations.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MEMORIES (HINDSIGHT CLOUD) */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Hindsight Memory Bank Units
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Bank: {memoryView?.bank_id}
                </span>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-xs">Fetching memories from Hindsight Cloud...</span>
                </div>
              ) : !memoryView?.memories || memoryView.memories.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                  <BrainCircuit className="w-8 h-8 text-slate-300" />
                  <div className="text-xs font-semibold text-slate-600">No raw memory units stored yet</div>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    As this customer converses with SupportMind, memories will be automatically extracted, consolidated, and indexed by Hindsight.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memoryView.memories.map((mem, idx) => (
                    <div
                      key={mem.id || idx}
                      className="p-4 rounded-xl border border-purple-100 bg-purple-50/20 hover:bg-purple-50/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded font-semibold">
                          ID: {mem.id || `mem-${idx}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {mem.timestamp ? new Date(mem.timestamp).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        "{mem.text}"
                      </p>
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex items-center space-x-1.5 pt-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {mem.tags.map((t, i) => (
                            <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.2 rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Working Solutions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Solutions That Worked</span>
                </div>
                {memoryView?.successful_solutions?.length > 0 ? (
                  <div className="space-y-2">
                    {memoryView.successful_solutions.map((sol, i) => (
                      <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                        {sol}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No verified working solutions recorded yet.</p>
                )}
              </div>

              {/* Failed Solutions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Solutions That Failed (Do Not Repeat)</span>
                </div>
                {memoryView?.failed_solutions?.length > 0 ? (
                  <div className="space-y-2">
                    {memoryView.failed_solutions.map((sol, i) => (
                      <div key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-900">
                        {sol}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No failed troubleshooting steps logged.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <h4 className="text-sm font-bold text-slate-900">Customer Environment & Known Issues</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">System Profile</div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Hardware:</span> <span className="font-bold text-slate-800">{customer?.device || 'Device not specified'}</span></div>

                  <div className="flex justify-between"><span className="text-slate-500">Organization:</span> <span className="font-bold text-slate-800">{customer?.company}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location:</span> <span className="font-bold text-slate-800">{customer?.location}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Plan:</span> <span className="font-bold text-blue-600">{customer?.plan}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">Known Reported Issues</div>
                {customer?.known_issues?.length > 0 ? (
                  <div className="space-y-2">
                    {customer.known_issues.map((iss, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{iss.title}</div>
                          <div className="text-[11px] text-slate-400">{iss.context}</div>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {iss.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No persistent issues reported.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">Tickets Submitted by {customer?.name} ({tickets.length})</h4>
            </div>
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No tickets found for this customer.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {tickets.map((t, idx) => {
                  const isResolved = t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed';
                  return (
                    <div key={t.id || `tkt-${idx}`} className="py-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{t.id}</span>
                          <h5 className="text-xs font-bold text-slate-800">{t.subject}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t.context}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                          {t.priority}
                        </span>
                        <button
                          onClick={() => handleToggleTicketStatus(t.id, t.status)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isResolved
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isResolved ? 'Reopen' : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONVERSATIONS */}
        {activeTab === 'conversations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Conversation Transcripts ({conversations.length})</h4>
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No conversations recorded for this customer.</p>
            ) : (
              <div className="space-y-4">
                {conversations.map(conv => (
                  <div key={conv.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{conv.title || 'Support Session'}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{conv.id}</span>
                      </div>
                      <button
                        onClick={() => navigate('/admin/conversations', { state: { selectedConvId: conv.id } })}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        Open Dialogue
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(conv.messages || []).map((m, idx) => (
                        <div key={idx} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="font-bold text-[10px] text-slate-500 mb-0.5">{m.sender_name || m.sender}:</div>
                          <div className="text-slate-700 whitespace-pre-wrap">{m.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
