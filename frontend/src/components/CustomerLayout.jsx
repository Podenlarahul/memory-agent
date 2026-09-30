import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  Ticket, 
  User, 
  Settings, 
  LogOut, 
  Search,
  Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function CustomerLayout({ currentUser, onLogout, children, searchValue, setSearchValue }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  const currentSearch = searchValue !== undefined ? searchValue : localSearch;
  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (setSearchValue) setSearchValue(val);
    else setLocalSearch(val);
  };

  const navItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/customer/chat', label: 'My Support', icon: MessageSquare },
    { path: '/customer/tickets', label: 'My Tickets', icon: Ticket },
    { path: '/customer/profile', label: 'My Profile', icon: User },
    { path: '/customer/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return 'K';
    return name.trim().charAt(0).toUpperCase();
  };

  const userName = currentUser?.name || 'Karthik';
  const userEmail = currentUser?.email || 'karthik@example.com';
  const initial = getInitial(userName);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo Header */}
          <Link to="/customer/dashboard" className="px-6 py-5 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-blue-600">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SupportMind</span>
          </Link>

          {/* Navigation Items */}
          <nav className="px-3.5 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                item.path === '/customer/dashboard'
                  ? location.pathname === '/customer/dashboard'
                  : item.path === '/customer/chat'
                  ? location.pathname.startsWith('/customer/chat')
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-1 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{userName}</div>
              <div className="text-xs text-slate-400 truncate">{userEmail}</div>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          {/* Search Bar */}
          <div className="relative w-full max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder="Search for help, tickets, or conversations..."
              className="w-full bg-[#f1f5f9]/80 hover:bg-[#f1f5f9] focus:bg-white text-slate-700 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2 border border-slate-200/60 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 ml-4">
            <button 
              type="button" 
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            <Link
              to="/customer/profile"
              className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs hover:opacity-95 transition-opacity"
              title={userName}
            >
              {initial}
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
