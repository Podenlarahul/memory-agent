import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  BrainCircuit, 
  Laptop, 
  Building, 
  ArrowRight, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';

export default function AdminCustomersPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data || []);
    } catch (e) {
      console.warn('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await api.seedDemoCustomer();
      await loadCustomers();
    } catch (e) {
      alert('Error seeding demo customer: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.device?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Customer Directory</h2>
          <p className="text-xs text-slate-500">Manage customer accounts and inspect persistent Hindsight memory banks</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Populate a sample customer profile for hackathon demonstration"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-blue-600" />}
            <span>Seed Demo Customer</span>
          </button>
          <button
            onClick={loadCustomers}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Search */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, device..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredCustomers.length}</span> customers
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading customer directory...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No customers registered yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  When new customers sign up or start support sessions, their profiles and memory banks will appear here.
                </p>
              </div>
              <button
                onClick={handleSeedDemo}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer mt-1"
              >
                Create Demo Customer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Hardware & Company</th>
                    <th className="py-3.5 px-6">Memory Bank</th>
                    <th className="py-3.5 px-6">Open Tickets</th>
                    <th className="py-3.5 px-6">Support Plan</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCustomers.map((cust) => {
                    const initials = cust.name ? cust.name.slice(0, 2).toUpperCase() : 'CU';
                    return (
                      <tr 
                        key={cust.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/admin/customers/${cust.id}`)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{cust.name}</div>
                              <div className="text-[11px] text-slate-400">{cust.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800 flex items-center space-x-1.5">
                            <Laptop className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cust.device || 'Device not specified'}</span>
                          </div>

                          <div className="text-[11px] text-slate-400">{cust.company || 'Personal'}</div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold">
                            <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                            <span>SupportMind-{cust.id}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            (cust.open_tickets || 0) > 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.open_tickets || 0} active
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-blue-600 font-semibold text-[11px]">
                            {cust.plan || 'Premium Support'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/customers/${cust.id}`);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:underline inline-flex items-center space-x-1"
                          >
                            <span>Inspect Memories</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
