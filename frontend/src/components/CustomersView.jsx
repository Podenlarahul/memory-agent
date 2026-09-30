import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, MessageSquare, Laptop, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomersView({ customers = [], onSelectCustomer, onSwitchToChat }) {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.device.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your customers and their persistent Hindsight support history.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers or company..."
                className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 shadow-2xs"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Company</th>
                <th className="py-3.5 px-6">Device</th>
                <th className="py-3.5 px-6">Tickets</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Active</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-slate-400 text-[11px]">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {c.company}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                    {c.device}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-800">{c.total_tickets}</span>
                    {c.open_tickets > 0 && (
                      <span className="ml-1.5 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                        {c.open_tickets} Open
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="capitalize">{c.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    {c.last_active}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        onSelectCustomer(c);
                        onSwitchToChat();
                      }}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
