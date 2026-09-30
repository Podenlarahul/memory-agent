import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Ticket, 
  Clock, 
  Star, 
  Wifi, 
  Laptop, 
  Printer, 
  Shield, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  Bot,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';

export default function CustomerDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStartingConv, setIsStartingConv] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Ticket Modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketContext, setTicketContext] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketError, setTicketError] = useState('');

  const userName = currentUser?.name || 'Karthik';
  const openTicketsCount = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
  const resolvedTicketsCount = tickets.filter(t => t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed').length;

  // Seeded conversations matching screenshot
  const initialDefaultConversations = [
    {
      id: 'conv_wifi_zoom',
      icon: Wifi,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Wi-Fi keeps disconnecting during Zoom',
      snippet: 'I remember you previously had a similar Wi-Fi issue on your ASUS...',
      time: '2 hours ago'
    },
    {
      id: 'conv_laptop_battery',
      icon: Laptop,
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'Laptop battery draining quickly',
      snippet: 'Here are some steps to check background apps and power settings...',
      time: '1 day ago'
    },
    {
      id: 'conv_printer_win11',
      icon: Printer,
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: 'Printer not working on Windows 11',
      snippet: 'Let me help you troubleshoot the printer connection issue...',
      time: '3 days ago'
    },
    {
      id: 'conv_vpn_issue',
      icon: Shield,
      iconBg: 'bg-rose-50 text-rose-600',
      title: 'VPN connection issues',
      snippet: "Based on your previous setup, let's try adjusting the MTU settings...",
      time: '5 days ago'
    }
  ];

  // Seeded tickets matching screenshot
  const initialDefaultTickets = [
    {
      id: 'TKT-2026-001',
      subject: 'Wi-Fi disconnects frequently',
      status: 'Open',
      created_at: 'Created 2 days ago'
    },
    {
      id: 'TKT-2026-002',
      subject: 'Printer driver installation issue',
      status: 'Resolved',
      created_at: 'Resolved 5 days ago'
    },
    {
      id: 'TKT-2026-003',
      subject: 'Battery drain problem',
      status: 'Resolved',
      created_at: 'Resolved 1 week ago'
    }
  ];

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backendConvs, backendTkts] = await Promise.all([
        api.getConversations().catch(() => []),
        api.getTickets().catch(() => [])
      ]);

      // If backend has tickets, combine or use them
      if (backendTkts && backendTkts.length > 0) {
        setTickets(backendTkts);
      } else {
        setTickets(initialDefaultTickets);
      }

      // If backend has conversations, format them
      if (backendConvs && backendConvs.length > 0) {
        const mapped = backendConvs.map((c, idx) => {
          const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].message : 'AI customer support session';
          const iconSets = [
            { icon: Wifi, iconBg: 'bg-blue-50 text-blue-600' },
            { icon: Laptop, iconBg: 'bg-purple-50 text-purple-600' },
            { icon: Printer, iconBg: 'bg-emerald-50 text-emerald-600' },
            { icon: Shield, iconBg: 'bg-rose-50 text-rose-600' }
          ];
          const chosen = iconSets[idx % iconSets.length];
          return {
            id: c.id,
            icon: chosen.icon,
            iconBg: chosen.iconBg,
            title: c.title || 'Support Session',
            snippet: lastMsg,
            time: c.updated_at || 'Recently'
          };
        });
        setConversations(mapped);
      } else {
        setConversations(initialDefaultConversations);
      }
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
      setTickets(initialDefaultTickets);
      setConversations(initialDefaultConversations);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (customTitle) => {
    if (isStartingConv) return;
    try {
      setIsStartingConv(true);
      const cid = currentUser?.customer_id || `cust_${currentUser?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'user'}_001`;
      const res = await api.createConversation(
        cid,
        customTitle || `Support Session - ${new Date().toLocaleDateString()}`
      );
      if (res && res.conversation_id) {
        navigate(`/customer/chat/${res.conversation_id}`);
      } else {
        navigate('/customer/chat');
      }
    } catch (e) {
      console.warn('Start conversation fallback:', e);
      navigate('/customer/chat');
    } finally {
      setIsStartingConv(false);
    }
  };

  const handleOpenConversation = (convId) => {
    navigate(`/customer/chat/${convId}`);
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim()) {
      setTicketError('Please provide a ticket subject.');
      return;
    }

    try {
      setIsSubmittingTicket(true);
      setTicketError('');
      
      const newTkt = await api.createTicket(
        ticketSubject.trim(), 
        ticketPriority, 
        ticketContext.trim() || ticketSubject.trim()
      );

      // Prepend to tickets state immediately
      setTickets(prev => [newTkt, ...prev]);
      setIsTicketModalOpen(false);
      setTicketSubject('');
      setTicketContext('');
      setTicketPriority('Medium');
      // Reload tickets from server in background
      api.getTickets().then(data => {
        if (data && data.length > 0) setTickets(data);
      }).catch(() => {});
    } catch (err) {
      setTicketError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleToggleTicketStatus = async (ticketId, currentStatus, e) => {
    e?.stopPropagation();
    const newStatus = currentStatus?.toLowerCase() === 'resolved' ? 'open' : 'resolved';
    try {
      setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: newStatus === 'resolved' ? 'Resolved' : 'Open' } : t)));
      await api.updateTicketStatus(ticketId, newStatus);
    } catch (err) {
      console.warn('Failed to toggle ticket status:', err);
    }
  };

  const popularTopics = [
    {
      title: 'Network & Internet',
      subtitle: 'Wi-Fi, Ethernet, VPN issues',
      icon: Wifi,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Laptop & Hardware',
      subtitle: 'Battery, performance, drivers',
      icon: Laptop,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Printers & Peripherals',
      subtitle: 'Setup, connection, troubleshooting',
      icon: Printer,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Security & Privacy',
      subtitle: 'VPN, firewall, account security',
      icon: Shield,
      iconBg: 'bg-rose-50 text-rose-600'
    }
  ];

  // Filtering based on search bar
  const filteredConversations = conversations.filter(c => 
    !searchValue || 
    c.title.toLowerCase().includes(searchValue.toLowerCase()) || 
    c.snippet.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => 
    !searchValue || 
    t.subject?.toLowerCase().includes(searchValue.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <CustomerLayout 
      currentUser={currentUser} 
      onLogout={onLogout}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    >
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* ROW 1: WELCOME BANNER & CHAT BANNER */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Welcome Text */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {userName}! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              How can we help you today? Our AI support agent is here to assist you.
            </p>
          </div>

          {/* Chat with SupportMind mini-banner */}
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-xs">
            {/* Robot face avatar */}
            <div className="w-14 h-14 rounded-full bg-white shadow-xs p-1 flex items-center justify-center shrink-0 border border-blue-100/60 overflow-hidden">
              <img 
                src="/robot.jpg" 
                alt="SupportMind AI" 
                className="w-full h-full object-cover object-top scale-125"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chat with SupportMind</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug max-w-xs">
                Get instant support, personalized with your previous interactions.
              </p>
              <button
                onClick={() => handleStartConversation()}
                disabled={isStartingConv}
                className="mt-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-70 active:scale-98"
              >
                {isStartingConv ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Start a Conversation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: 4 METRIC / KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Conversations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Conversations</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">{conversations.length}</div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5">Active history</div>
            </div>
          </div>

          {/* Card 2: Support Tickets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Support Tickets</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">{tickets.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {openTicketsCount} open · {resolvedTicketsCount} resolved
              </div>
            </div>
          </div>

          {/* Card 3: Avg Response Time */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Avg. Response Time</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">2 mins</div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5">↓ 40% faster</div>
            </div>
          </div>

          {/* Card 4: Satisfaction Rating */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Satisfaction Rating</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">4.8 / 5</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Based on {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: 2-COLUMN MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Conversations */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Recent Conversations</h2>
                <button
                  onClick={() => navigate('/customer/chat')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {filteredConversations.map((conv, idx) => {
                  const Icon = conv.icon || MessageSquare;
                  return (
                    <div
                      key={`${conv.id}_${idx}`}
                      onClick={() => handleOpenConversation(conv.id)}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div className={`w-10 h-10 rounded-xl ${conv.iconBg || 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {conv.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5 max-w-md">
                            {conv.snippet}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400">{conv.time}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">My Tickets</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                  <button
                    onClick={() => navigate('/customer/tickets')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {filteredTickets.map((tkt, idx) => {
                  const isOpen = tkt.status?.toLowerCase() === 'open';
                  const displayId = tkt.id.startsWith('#') ? tkt.id : `#${tkt.id}`;
                  return (
                    <div
                      key={tkt.id || idx}
                      onClick={() => navigate('/customer/tickets')}
                      className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100/80"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleTicketStatus(tkt.id, tkt.status, e)}
                            className="cursor-pointer transition-transform active:scale-95 text-left"
                            title={`Click to mark as ${isOpen ? 'Resolved' : 'Open'}`}
                          >
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                <span>Open</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Resolved</span>
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {tkt.subject}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {displayId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400">
                          {tkt.created_at || 'Recently'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN */}
          <div className="space-y-6">
            
            {/* SupportMind AI Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center p-0.5">
                    <img 
                      src="/robot.jpg" 
                      alt="SupportMind AI" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">SupportMind AI</h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online</span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                Get instant, personalized support with AI that remembers your previous interactions.
              </p>

              {/* Start Button */}
              <button
                onClick={() => handleStartConversation()}
                disabled={isStartingConv}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-70"
              >
                {isStartingConv ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Start a Conversation</span>
                  </>
                )}
              </button>

              {/* Features list */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Remembers your past issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Provides personalized solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Available 24/7</span>
                </div>
              </div>

              {/* Cute Waving Robot Illustration */}
              <div className="mt-4 flex justify-end -mr-2 -mb-2">
                <div className="w-32 h-32 relative">
                  <img 
                    src="/robot.jpg" 
                    alt="Friendly Robot" 
                    className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Popular Help Topics */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">Popular Help Topics</h3>
                <button
                  onClick={() => handleStartConversation('Help Topics Overview')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {popularTopics.map((topic, idx) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleStartConversation(`Troubleshoot: ${topic.title}`)}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-9 h-9 rounded-xl ${topic.iconBg} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {topic.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {topic.subtitle}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* CREATE TICKET MODAL */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTicketModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Create Support Ticket</h3>
                    <p className="text-xs text-slate-500">Log an issue for personalized AI troubleshooting</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="p-6 space-y-4">
                {ticketError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Issue Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Wi-Fi keeps disconnecting during video calls"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                  >
                    <option value="Low">Low - Minor question or feedback</option>
                    <option value="Medium">Medium - Regular support request</option>
                    <option value="High">High - Major blocker / Urgent problem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Context & Symptoms
                  </label>
                  <textarea
                    rows={4}
                    value={ticketContext}
                    onChange={(e) => setTicketContext(e.target.value)}
                    placeholder="Describe what you observed, error messages, and what troubleshooting you already tried..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Create Ticket</span>
                    )}
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
