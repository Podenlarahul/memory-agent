import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  BrainCircuit, 
  Clock, 
  User, 
  Loader2, 
  RefreshCw,
  Laptop,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';

export default function AdminConversationsPage({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAdminConversations();
      setConversations(data || []);
      
      const targetId = location.state?.selectedConvId;
      if (targetId && data && data.length > 0) {
        const found = data.find(c => c.id === targetId);
        if (found) {
          setSelectedConv(found);
          return;
        }
      }
      if (data && data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_email?.toLowerCase().includes(q) ||
      c.customer_id?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Support Conversations</h2>
          <p className="text-xs text-slate-500">Live & archived AI support transcripts across all customer accounts ({conversations.length} total)</p>
        </div>

        <button
          onClick={loadConversations}
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Workspace (Split View) */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left List */}
        <div className="w-full md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, title, message..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs px-4">
                No customer conversations found.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = selectedConv?.id === conv.id;
                const custName = conv.customer_name || 'Customer';
                const initial = custName.slice(0, 1).toUpperCase();
                const status = (conv.status || 'Open').toLowerCase();
                const isResolved = status === 'resolved' || status === 'closed';
                const isInProg = status === 'in progress' || status === 'in_progress';
                const msgCount = conv.messages?.length || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {conv.customer_avatar || initial}
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {custName}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isResolved 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isInProg
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {conv.status || 'Open'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium truncate mb-1">
                      {conv.title || 'Support Session'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[160px]">{conv.time || conv.updated_at || 'Recent'}</span>
                      <span className="font-semibold text-slate-500">{msgCount} message{msgCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Transcript View */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {selectedConv ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-900">{selectedConv.title || 'Support Session'}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      selectedConv.status?.toLowerCase() === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {selectedConv.status || 'Open'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-800">{selectedConv.customer_name || 'Customer'}</span>
                    {selectedConv.customer_email && <span>• {selectedConv.customer_email}</span>}
                    <span className="font-mono text-slate-400">ID: {selectedConv.customer_id}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/admin/customers/${selectedConv.customer_id}`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Customer</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <div className="flex items-center space-x-1.5 text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-xl font-medium">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                    <span>Hindsight Linked</span>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(!selectedConv.messages || selectedConv.messages.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No messages exchanged in this session yet.
                  </div>
                ) : (
                  selectedConv.messages.map((m, idx) => {
                    const isCust = m.sender === 'customer';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isCust ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="text-[10px] text-slate-400 px-1 font-medium">
                          {m.sender_name || (isCust ? selectedConv.customer_name || 'Customer' : 'SupportMind AI')} • {m.timestamp}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-2xs leading-relaxed ${
                            isCust
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          {m.memories_used && m.memories_used.length > 0 && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[10px] text-purple-700 font-medium">
                              🧠 Recalled Memory: {m.memories_used.join('; ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to view the full dialogue transcript.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
