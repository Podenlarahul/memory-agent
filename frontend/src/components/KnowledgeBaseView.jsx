import React from 'react';
import { BookOpen, Search, FileText, CheckCircle2, Database, Shield, Cpu } from 'lucide-react';

export default function KnowledgeBaseView() {
  const articles = [
    {
      category: 'Network & Connectivity',
      title: 'Dell XPS 15 Intel Killer Wi-Fi 6 AX1650 Drop Resolution',
      snippet: 'Power management state transitions and Roaming Aggressiveness settings optimization for sustained UDP video conferencing.',
      views: '1,420 views',
      updated: 'Updated Aug 2026'
    },
    {
      category: 'Thermal & Power',
      title: 'Managing Modern Standby S0 Sleep Battery Drain in Windows 11',
      snippet: 'Registry adjustments to disable network connectivity in standby and tune PCIe ASPM link states.',
      views: '980 views',
      updated: 'Updated Aug 2026'
    },
    {
      category: 'Printer Hardware',
      title: 'HP LaserJet Tray 2 Solenoid Flag and Roller Maintenance',
      snippet: 'Step-by-step cleaning of pickup and feed rollers using 99% isopropyl alcohol to eliminate phantom paper jams.',
      views: '760 views',
      updated: 'Updated Jul 2026'
    },
    {
      category: 'Enterprise Security',
      title: 'WireGuard & OpenVPN MTU Optimization over LTE / High-Jitter Links',
      snippet: 'Preventing packet fragmentation by lowering tunnel MTU from default 1500 to 1380 for corporate users.',
      views: '1,120 views',
      updated: 'Updated Aug 2026'
    }
  ];

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
            <p className="text-sm text-slate-500 mt-1">
              Internal troubleshooting directives and documentation integrated with Hindsight retrieval.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-medium">
            <Database className="w-3.5 h-3.5" />
            <span>Hindsight Semantic Reranker Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-blue-400 transition-colors">
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {art.category}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{art.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{art.snippet}</p>
              <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between border-t border-slate-100">
                <span>{art.views}</span>
                <span>{art.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
