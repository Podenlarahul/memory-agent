import React from 'react';
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  BrainCircuit,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center space-x-1.5">
              <span>SupportMind</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              AI Support with Memory
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Hindsight Badge */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>Hindsight Memory</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Autonomous long-term recall & reflection active for all customers.
        </p>
      </div>
    </aside>
  );
}
