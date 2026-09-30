import React, { useState } from 'react';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConversationList({
  customers = [],
  selectedCustomer,
  onSelectCustomer,
  onNewConversation
}) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.known_issues[0]?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.device.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'open') return c.open_tickets > 0;
    if (filter === 'closed') return c.open_tickets === 0;
    return true;
  });

  // Avatar color map for visual distinction
  const avatarColors = {
    RS: 'bg-blue-600 text-white',
    PM: 'bg-pink-500 text-white',
    AK: 'bg-emerald-600 text-white',
    SP: 'bg-purple-600 text-white',
    VS: 'bg-amber-600 text-white',
    NT: 'bg-cyan-600 text-white',
    AR: 'bg-indigo-600 text-white',
    KM: 'bg-rose-600 text-white',
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Top Action */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-150 shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Filter Tabs: All, Open, Closed */}
        <div className="flex items-center space-x-1 mt-3 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          {['all', 'open', 'closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 rounded-md capitalize transition-all duration-150 ${
                filter === tab
                  ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredCustomers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No conversations match your search.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isSelected = selectedCustomer?.id === c.id;
            const avatarColor = avatarColors[c.avatar] || 'bg-slate-700 text-white';
            const issueSnippet = c.known_issues[0]?.title || 'Support ticket query';

            return (
              <motion.div
                key={c.id}
                whileHover={{ backgroundColor: isSelected ? undefined : '#f8fafc' }}
                onClick={() => onSelectCustomer(c)}
                className={`p-3.5 cursor-pointer transition-all duration-150 flex items-start space-x-3 relative ${
                  isSelected ? 'bg-blue-50/80' : 'bg-white'
                }`}
              >
                {/* Active Indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
                )}

                {/* Avatar with Status Dot */}
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs shadow-2xs`}>
                    {c.avatar}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0">
                      {c.last_active}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1.5">
                    {issueSnippet}
                  </p>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                      {c.device}
                    </span>
                    {c.open_tickets > 0 ? (
                      <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded font-medium">
                        {c.open_tickets} Open
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.2 rounded font-medium flex items-center space-x-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
