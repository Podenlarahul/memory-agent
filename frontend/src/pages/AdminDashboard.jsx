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
  Calendar,
  ChevronDown,
  Bot,
  FileText,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';

export default function AdminDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Live Data States
  const [customers, setCustomers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default Fallbacks matching reference screenshot if backend is empty
  const defaultConversations = [
    {
      id: 'c1',
      customer: 'Rahul Verma',
      initial: 'R',
      avatarBg: 'bg-blue-500 text-white',
      message: 'My Wi-Fi keeps disconnecting during ...',
      intent: 'Network Issue',
      intentBg: 'bg-blue-50 text-blue-600',
      status: 'Resolved',
      statusBg: 'bg-emerald-50 text-emerald-600',
      time: '10 mins ago'
    },
    {
      id: 'c2',
      customer: 'Sri Nandini',
      initial: 'S',
      avatarBg: 'bg-purple-500 text-white',
      message: 'Laptop battery draining quickly, an...',
      intent: 'Hardware',
      intentBg: 'bg-purple-50 text-purple-600',
      status: 'In Progress',
      statusBg: 'bg-blue-50 text-blue-600',
      time: '45 mins ago'
    },
    {
      id: 'c3',
      customer: 'Arjun Mehta',
      initial: 'A',
      avatarBg: 'bg-indigo-500 text-white',
      message: 'Printer not working on Windows 11',
      intent: 'Printer Issue',
      intentBg: 'bg-rose-50 text-rose-600',
      status: 'Open',
      statusBg: 'bg-rose-50 text-rose-600',
      time: '2 hours ago'
    },
    {
      id: 'c4',
      customer: 'Priya Sharma',
      initial: 'P',
      avatarBg: 'bg-pink-500 text-white',
      message: 'VPN connection drops frequently',
      intent: 'Network Issue',
      intentBg: 'bg-blue-50 text-blue-600',
      status: 'Resolved',
      statusBg: 'bg-emerald-50 text-emerald-600',
      time: '3 hours ago'
    },
    {
      id: 'c5',
      customer: 'Karthik Reddy',
      initial: 'K',
      avatarBg: 'bg-amber-500 text-white',
      message: 'How to update graphics drivers?',
      intent: 'Software',
      intentBg: 'bg-amber-50 text-amber-600',
      status: 'Resolved',
      statusBg: 'bg-emerald-50 text-emerald-600',
      time: '5 hours ago'
    }
  ];

  const kbTopics = [
    {
      title: 'Wi-Fi 6 Connection Issues',
      articles: '12 articles',
      icon: Wifi,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Windows 11 Battery Optimization',
      articles: '8 articles',
      icon: Laptop,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'HP LaserJet Troubleshooting',
      articles: '6 articles',
      icon: Printer,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'VPN Configuration Guide',
      articles: '10 articles',
      icon: Shield,
      iconBg: 'bg-rose-50 text-rose-600'
    }
  ];

  const kbUpdates = [
    {
      title: 'Added: Windows 11 Wi-Fi Troubleshooting Guide',
      time: '2 days ago'
    },
    {
      title: 'Updated: Printer Driver Installation Steps',
      time: '4 days ago'
    },
    {
      title: 'Added: VPN MTU Optimization for High-Latency Links',
      time: '1 week ago'
    },
    {
      title: 'Updated: Dell XPS 15 Power Management Settings',
      time: '1 week ago'
    }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [custList, convList, tktList] = await Promise.all([
        api.getCustomers().catch(() => []),
        api.getAllAdminConversations().catch(() => []),
        api.getTickets().catch(() => [])
      ]);
      setCustomers(custList || []);
      setConversations(convList || []);
      setTickets(tktList || []);
    } catch (e) {
      console.warn('Failed to load admin customer data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Avatar color generator based on name
  const getAvatarBg = (name, idx) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-purple-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-amber-500 text-white',
      'bg-emerald-500 text-white',
      'bg-cyan-500 text-white'
    ];
    return colors[idx % colors.length];
  };

  // Format real conversations or use defaults
  const displayConversations = conversations.length > 0
    ? conversations.map((c, idx) => {
        const custName = c.customer_name || c.customer?.name || 'Customer';
        const initial = custName.trim().charAt(0).toUpperCase();
        
        let intent = c.intent || 'Network Issue';
        let intentBg = 'bg-blue-50 text-blue-600';
        if (intent === 'Hardware') intentBg = 'bg-purple-50 text-purple-600';
        else if (intent === 'Printer Issue') intentBg = 'bg-rose-50 text-rose-600';
        else if (intent === 'Software') intentBg = 'bg-amber-50 text-amber-600';

        const status = c.status || 'Resolved';
        let statusBg = 'bg-emerald-50 text-emerald-600';
        if (status?.toLowerCase() === 'in progress') statusBg = 'bg-blue-50 text-blue-600';
        else if (status?.toLowerCase() === 'open') statusBg = 'bg-rose-50 text-rose-600';

        return {
          id: c.id || `conv_${idx}`,
          customer: custName,
          initial: initial,
          avatarBg: getAvatarBg(custName, idx),
          message: c.message || c.title || 'Support Session',
          intent: intent,
          intentBg: intentBg,
          status: status,
          statusBg: statusBg,
          time: c.time || c.updated_at || 'Recently'
        };
      })
    : defaultConversations;

  // Filter conversations by search input
  const filteredConversations = displayConversations.filter(c => 
    !searchValue || 
    c.customer.toLowerCase().includes(searchValue.toLowerCase()) || 
    c.message.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.intent.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Dynamic Ticket Status counts from live customer tickets
  const totalTicketsCount = Math.max(tickets.length, 1);
  const rawOpen = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
  const rawInProgress = tickets.filter(t => t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in_progress').length;
  const rawResolved = tickets.filter(t => t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed').length;
  const rawOnHold = tickets.filter(t => t.status?.toLowerCase() === 'on hold' || t.status?.toLowerCase() === 'on_hold').length;

  const openTickets = rawOpen;
  const inProgressTickets = rawInProgress;
  const resolvedTickets = rawResolved;
  const onHoldTickets = rawOnHold;

  const openPct = tickets.length > 0 ? Math.round((openTickets / totalTicketsCount) * 100) : 25;
  const inProgPct = tickets.length > 0 ? Math.round((inProgressTickets / totalTicketsCount) * 100) : 25;
  const resPct = tickets.length > 0 ? Math.round((resolvedTickets / totalTicketsCount) * 100) : 50;
  const onHoldPct = tickets.length > 0 ? Math.max(0, 100 - openPct - inProgPct - resPct) : 0;

  // Dynamic Donut SVG calculations
  const circumference = 238.76; // 2 * pi * 38
  const resDash = (resPct / 100) * circumference;
  const inProgDash = (inProgPct / 100) * circumference;
  const openDash = (openPct / 100) * circumference;
  const onHoldDash = (onHoldPct / 100) * circumference;

  // Dynamic Category Issues tally derived from live customer tickets & conversations
  const networkCount = tickets.filter(t => /wifi|wi-fi|vpn|network|connect/i.test((t.subject || '') + (t.context || ''))).length +
    conversations.filter(c => /wifi|wi-fi|vpn|network|connect/i.test((c.title || '') + (c.message || ''))).length;
  const hardwareCount = tickets.filter(t => /battery|overheat|display|hardware|laptop|screen/i.test((t.subject || '') + (t.context || ''))).length +
    conversations.filter(c => /battery|overheat|display|hardware|laptop|screen/i.test((c.title || '') + (c.message || ''))).length;
  const softwareCount = tickets.filter(t => /software|windows|os|driver|update/i.test((t.subject || '') + (t.context || ''))).length +
    conversations.filter(c => /software|windows|os|driver|update/i.test((c.title || '') + (c.message || ''))).length;
  const printerCount = tickets.filter(t => /printer|print|spooler/i.test((t.subject || '') + (t.context || ''))).length +
    conversations.filter(c => /printer|print|spooler/i.test((c.title || '') + (c.message || ''))).length;
  const audioCount = tickets.filter(t => /speaker|sound|audio|volume|phone/i.test((t.subject || '') + (t.context || ''))).length +
    conversations.filter(c => /speaker|sound|audio|volume|phone/i.test((c.title || '') + (c.message || ''))).length;

  const dynamicCategories = [
    { name: 'Network', count: Math.max(networkCount, 1), barColor: 'bg-blue-600' },
    { name: 'Hardware', count: Math.max(hardwareCount, 1), barColor: 'bg-purple-500' },
    { name: 'Software', count: Math.max(softwareCount, 1), barColor: 'bg-amber-400' },
    { name: 'Printers', count: Math.max(printerCount, 1), barColor: 'bg-emerald-400' },
    { name: 'Mobile & Audio', count: Math.max(audioCount, 1), barColor: 'bg-rose-500' }
  ];

  return (
    <AdminLayout 
      currentUser={currentUser} 
      onLogout={onLogout}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    >
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* ROW 1: WELCOME ROW WITH DATE PICKER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, Admin! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Here's an overview of your support system and AI agent performance.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                {['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeRange(t);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                      timeRange === t ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
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
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                {conversations.length}
              </div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span>↑ Live Sync</span>
                <span className="text-slate-400 font-normal">all accounts</span>
              </div>
            </div>
          </div>

          {/* Card 2: Support Tickets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Support Tickets</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                {tickets.length}
              </div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span>{openTickets} open</span>
                <span className="text-slate-400 font-normal">• {resolvedTickets} resolved</span>
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
              <div className="text-2xl font-bold text-slate-900 mt-0.5">1.8 mins</div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span>↓ 42%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Customer Satisfaction */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Customer Satisfaction</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">4.7 / 5</div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span>↑ 8%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: 3 MIDDLE CARDS (Ticket Overview, Ticket Status, AI Agent Performance) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* 1. Ticket Overview Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Ticket Overview</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Opened</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Resolved</span>
                </div>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full h-44 relative">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines & Labels */}
                {[
                  { y: 15, label: '40' },
                  { y: 48, label: '30' },
                  { y: 82, label: '20' },
                  { y: 115, label: '10' },
                  { y: 148, label: '0' }
                ].map((grid, idx) => (
                  <g key={idx}>
                    <line x1="30" y1={grid.y} x2="490" y2={grid.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y={grid.y + 4} fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                      {grid.label}
                    </text>
                  </g>
                ))}

                {/* Opened Area (Blue) */}
                <path
                  d="M 30 110 Q 70 85, 100 70 T 170 50 T 240 75 T 310 50 T 380 30 T 450 65 T 490 55 L 490 148 L 30 148 Z"
                  fill="url(#blueGrad)"
                />
                <path
                  d="M 30 110 Q 70 85, 100 70 T 170 50 T 240 75 T 310 50 T 380 30 T 450 65 T 490 55"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Resolved Area (Emerald) */}
                <path
                  d="M 30 135 Q 70 120, 100 105 T 170 95 T 240 100 T 310 80 T 380 65 T 450 75 T 490 70 L 490 148 L 30 148 Z"
                  fill="url(#emeraldGrad)"
                />
                <path
                  d="M 30 135 Q 70 120, 100 105 T 170 95 T 240 100 T 310 80 T 380 65 T 450 75 T 490 70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {/* X-axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 pl-6 pr-2">
                <span>Sep 1</span>
                <span>Sep 5</span>
                <span>Sep 10</span>
                <span>Sep 15</span>
                <span>Sep 20</span>
                <span>Sep 25</span>
                <span>Sep 30</span>
              </div>
            </div>
          </div>

          {/* 2. Ticket Status Donut Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Ticket Status</h3>
            
            <div className="flex items-center justify-around gap-4 my-auto">
              {/* Donut graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f8fafc" strokeWidth="14" />
                  
                  {/* Resolved slice (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray={`${resDash} ${circumference}`}
                    strokeDashoffset="0"
                  />
                  {/* In Progress slice (Blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="14"
                    strokeDasharray={`${inProgDash} ${circumference}`}
                    strokeDashoffset={`${-resDash}`}
                  />
                  {/* Open slice (Rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="14"
                    strokeDasharray={`${openDash} ${circumference}`}
                    strokeDashoffset={`${-(resDash + inProgDash)}`}
                  />
                  {/* On Hold slice (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="14"
                    strokeDasharray={`${onHoldDash} ${circumference}`}
                    strokeDashoffset={`${-(resDash + inProgDash + openDash)}`}
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-slate-900 leading-tight">
                    {totalTicketsCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Tickets</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-600">Open</span>
                  <span className="font-semibold text-slate-900 ml-auto">
                    {openTickets} ({openPct}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="text-slate-600">In Progress</span>
                  <span className="font-semibold text-slate-900 ml-auto">
                    {inProgressTickets} ({inProgPct}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600">Resolved</span>
                  <span className="font-semibold text-slate-900 ml-auto">
                    {resolvedTickets} ({resPct}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span className="text-slate-600">On Hold</span>
                  <span className="font-semibold text-slate-900 ml-auto">
                    {onHoldTickets} ({onHoldPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. AI Agent Performance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Agent Performance</h3>
            </div>

            <div className="space-y-4 my-auto">
              {/* Metric 1 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Successful Resolutions</span>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full w-[92%] transition-all"></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Knowledge Base Usage</span>
                  <span className="font-bold text-slate-900">78%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[78%] transition-all"></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Hindsight Memory Usage</span>
                  <span className="font-bold text-slate-900">64%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full w-[64%] transition-all"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 4: 2-COLUMN BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Conversations Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Conversations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live customer support sessions ({displayConversations.length} active)
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/conversations')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-3 pl-2">Customer</th>
                      <th className="pb-3">Message</th>
                      <th className="pb-3">Intent</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3 pr-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredConversations.slice(0, 8).map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => navigate('/admin/conversations', { state: { selectedConvId: c.id } })}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${c.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                              {c.initial}
                            </div>
                            <span className="font-semibold text-slate-900 whitespace-nowrap">
                              {c.customer}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500 max-w-xs truncate pr-3">
                          {c.message}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.intentBg}`}>
                            {c.intent}
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.statusBg}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {c.time}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Issues by Category Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-900">Top Issues by Category</h3>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bar Chart Container */}
              <div className="relative pt-6">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 pl-1 pr-4 pb-8">
                  <div className="border-b border-slate-100 flex items-center justify-between">
                    <span>40</span>
                  </div>
                  <div className="border-b border-slate-100 flex items-center justify-between">
                    <span>30</span>
                  </div>
                  <div className="border-b border-slate-100 flex items-center justify-between">
                    <span>20</span>
                  </div>
                  <div className="border-b border-slate-100 flex items-center justify-between">
                    <span>10</span>
                  </div>
                  <div className="border-b border-slate-200 flex items-center justify-between">
                    <span>0</span>
                  </div>
                </div>

                {/* Bars Row */}
                <div className="flex items-end justify-between pl-8 pr-6 h-48 relative z-10">
                  {dynamicCategories.map((item) => {
                    const heightPercent = (item.count / 40) * 100;
                    return (
                      <div key={item.name} className="flex flex-col items-center flex-1 max-w-[48px]">
                        <span className="text-xs font-bold text-slate-700 mb-1">
                          {item.count}
                        </span>
                        <div 
                          className={`w-full rounded-t-lg ${item.barColor} transition-all duration-500 hover:opacity-90`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-[11px] font-medium text-slate-600 mt-2 text-center truncate w-full">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN */}
          <div className="space-y-6">
            
            {/* Knowledge Base */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Knowledge Base</h3>
                </div>
                <button
                  onClick={() => navigate('/admin/knowledge-base')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {kbTopics.map((topic, idx) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate('/admin/knowledge-base')}
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
                            {topic.articles}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Knowledge Base Updates */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">Recent Knowledge Base Updates</h3>
                <button
                  onClick={() => navigate('/admin/knowledge-base')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {kbUpdates.map((update, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/admin/knowledge-base')}
                    className="flex items-start justify-between gap-3 text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors leading-tight">
                        {update.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {update.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
