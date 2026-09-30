import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Laptop, 
  Building, 
  MapPin, 
  ShieldCheck, 
  Tag, 
  RefreshCw,
  Sparkles,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPanel({
  customer,
  memories = {},
  onRefreshMemories,
  isLoadingMemories
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'interactions', 'hindsight'

  const memoryItems = memories.memories || [];
  const knownIssues = customer?.known_issues || [];
  const solutionsWorked = customer?.solutions_worked || [];
  const solutionsFailed = customer?.solutions_failed || [];
  const preferences = customer?.preferences || [];

  return (
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-hidden">
      {/* Panel Tab Navigation */}
      <div className="flex border-b border-slate-200 px-4 pt-3 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('interactions')}
          className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'interactions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Interactions</span>
        </button>

        <button
          onClick={() => setActiveTab('hindsight')}
          className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all duration-150 ${
            activeTab === 'hindsight'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
          <span>Hindsight</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Customer Header Card */}
        <div className="flex items-center space-x-3.5 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
            {customer?.avatar || 'RS'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-slate-900 text-sm truncate">{customer?.name}</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-semibold shrink-0">
                VIP
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{customer?.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Customer since Jan 2024</p>
          </div>
        </div>

        {/* TAB 1: Profile & Known Customer Memory */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Metadata Grid */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company</span>
                </span>
                <span className="font-semibold text-slate-800">{customer?.company}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>Device</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">{customer?.device}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location</span>
                </span>
                <span className="font-semibold text-slate-800">{customer?.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Plan</span>
                </span>
                <span className="font-semibold text-blue-600">{customer?.plan}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Total Tickets / Open</span>
                <span className="font-semibold text-slate-800">
                  {customer?.total_tickets} / <strong className="text-rose-600">{customer?.open_tickets}</strong>
                </span>
              </div>
            </div>

            {/* Known Issues */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Known Issues</span>
                </h4>
                <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.2 rounded-full font-bold">
                  {knownIssues.length}
                </span>
              </div>
              <div className="space-y-2">
                {knownIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 text-xs"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-900">{issue.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded font-semibold">
                        {issue.status}
                      </span>
                    </div>
                    {issue.context && (
                      <p className="text-[11px] text-slate-600">{issue.context}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions that Worked */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Solutions that Worked</span>
                </h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.2 rounded-full font-bold">
                  {solutionsWorked.length}
                </span>
              </div>
              <div className="space-y-2">
                {solutionsWorked.map((sol, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40 text-xs flex items-start space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">{sol.title}</div>
                      <div className="text-[11px] text-slate-600">{sol.note}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{sol.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions that Failed */}
            {solutionsFailed.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Solutions that Failed</span>
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded-full font-bold">
                    {solutionsFailed.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {solutionsFailed.map((sol, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-start space-x-2"
                    >
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">{sol.title}</div>
                        <div className="text-[11px] text-slate-600">{sol.note}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sol.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-purple-500" />
                  <span>Customer Preferences</span>
                </h4>
              </div>
              <div className="space-y-1.5">
                {preferences.map((pref, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-purple-50/50 border border-purple-100 text-xs text-purple-900 flex items-start space-x-2"
                  >
                    <span className="text-purple-500 text-sm leading-none">•</span>
                    <span>{pref}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Past Interactions */}
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 leading-relaxed">
              Chronological log of past sessions, ticket escalations, and resolution notes for {customer?.name}.
            </div>

            <div className="border-l-2 border-blue-200 pl-4 space-y-4 text-xs">
              <div className="relative">
                <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Wi-Fi Disconnect Reported</div>
                <div className="text-[11px] text-slate-500">Aug 10, 2026 • Ticket #TK-8492</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Customer reported Wi-Fi cuts out during Zoom calls on Dell XPS 15. Attempted driver reinstall.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Overheating Checkup</div>
                <div className="text-[11px] text-slate-500">Jul 22, 2026 • Ticket #TK-7319</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Fan spinning excessively under load. Advised setting power mode to Balanced.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="font-semibold text-slate-800">Onboarding & Setup</div>
                <div className="text-[11px] text-slate-500">Jan 15, 2024 • Ticket #TK-1002</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Initial hardware provisioning and VPN certificate generation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Live Hindsight Cloud Memory Stream */}
        {activeTab === 'hindsight' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-900">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="font-bold">Hindsight Memory Bank</div>
                  <div className="font-mono text-[10px] text-indigo-700">
                    Bank: {memories.bank_id || `SupportMind-${customer?.id}`}
                  </div>
                </div>
              </div>
              <button
                onClick={onRefreshMemories}
                disabled={isLoadingMemories}
                className="p-1.5 bg-white text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                title="Refresh memories from Hindsight Cloud"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMemories ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Retained Long-Term Facts ({memoryItems.length}):</span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Live Cloud Sync
              </span>
            </div>

            {memoryItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No raw memory items stored in Hindsight yet. Send a message to extract and retain facts!
              </div>
            ) : (
              <div className="space-y-3">
                {memoryItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded uppercase">
                        {item.type || 'observation'}
                      </span>
                      <span className="text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Active'}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed font-mono text-[11px]">
                      {item.text}
                    </p>

                    {item.entities && (
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-1 border-t border-slate-100">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Entities: <strong>{item.entities}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
