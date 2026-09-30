import React, { useState } from 'react';
import { Search, Bell, Shield, Cpu, User, LogOut, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({
  currentUser,
  onLogout,
  activeView,
  setActiveView,
  selectedCustomer,
  customers = [],
  onSelectCustomer,
  hindsightStatus
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search customers, tickets, or knowledge..."
          className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
        />
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Hindsight Cloud Status Pill */}
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hindsight: {hindsightStatus?.connected ? 'Online' : 'Connected'}</span>
          <span className="text-emerald-500 text-[10px] hidden sm:inline font-mono">
            ({hindsightStatus?.bank_id || 'SupportMind'})
          </span>
        </div>

        {/* View Switcher: Support Agent vs Customer View */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveView('agent')}
            className={`px-3 py-1 rounded-md font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeView === 'agent'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Agent View</span>
          </button>
          <button
            onClick={() => setActiveView('customer')}
            className={`px-3 py-1 rounded-md font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeView === 'customer'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </button>
        </div>

        {/* Active Customer Switcher for Portal */}
        {activeView === 'customer' && (
          <div className="relative">
            <button
              onClick={() => setShowCustomerPicker(!showCustomerPicker)}
              className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
            >
              <span>Viewing as: <strong>{selectedCustomer?.name || 'Rahul Sharma'}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
            </button>

            <AnimatePresence>
              {showCustomerPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Customer Context
                  </div>
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCustomer(c);
                        setShowCustomerPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        selectedCustomer?.id === c.id ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.device}</div>
                      </div>
                      {selectedCustomer?.id === c.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AO'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser?.name || 'Admin'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {activeView === 'agent' ? 'Support Specialist' : 'Customer Account'}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-800">{currentUser?.name || 'Admin'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'admin@supportmind.ai'}</div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
