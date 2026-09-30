import React from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star, 
  BrainCircuit, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsView() {
  const metrics = [
    { label: 'Total Tickets', value: '124', change: '+12%', isPositive: true, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Resolved Tickets', value: '98', change: '+18%', isPositive: true, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Avg. Resolution Time', value: '2.4 hrs', change: '-23%', isPositive: true, icon: Clock, color: 'text-amber-600 bg-amber-50', note: 'Faster with Hindsight' },
    { label: 'Customer Satisfaction', value: '4.8/5', change: '+8%', isPositive: true, icon: Star, color: 'text-purple-600 bg-purple-50' },
  ];

  const categories = [
    { name: 'Network & Internet', percentage: 32, color: 'bg-blue-600' },
    { name: 'Software Installation', percentage: 24, color: 'bg-indigo-500' },
    { name: 'Hardware Issues', percentage: 18, color: 'bg-emerald-500' },
    { name: 'Account Access', percentage: 14, color: 'bg-amber-500' },
    { name: 'Billing', percentage: 8, color: 'bg-purple-500' },
    { name: 'Other', percentage: 4, color: 'bg-slate-400' },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track performance and AI customer support insights enabled by Hindsight memory.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{m.label}</span>
                  <div className={`p-2 rounded-xl ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{m.value}</span>
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {m.change}
                  </span>
                </div>

                {m.note && (
                  <div className="text-[10px] text-indigo-600 font-medium mt-2 flex items-center space-x-1">
                    <BrainCircuit className="w-3 h-3" />
                    <span>{m.note}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Trends Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ticket Trends</h3>
                <p className="text-xs text-slate-400">Daily support requests vs memory recalls</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Last 30 Days</span>
            </div>

            {/* SVG Trend Wave */}
            <div className="h-52 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 150" fill="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                {/* Area */}
                <path
                  d="M0,110 C50,120 100,70 150,85 C200,100 250,40 300,55 C350,70 400,20 450,35 L500,45 L500,150 L0,150 Z"
                  fill="url(#trendGradient)"
                />
                {/* Line */}
                <path
                  d="M0,110 C50,120 100,70 150,85 C200,100 250,40 300,55 C350,70 400,20 450,35 L500,45"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>Sep 01</span>
                <span>Sep 05</span>
                <span>Sep 10</span>
                <span>Sep 15</span>
                <span>Sep 20</span>
                <span>Sep 28</span>
              </div>
            </div>
          </div>

          {/* Issues by Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Issues by Category</h3>
            <p className="text-xs text-slate-400">Distribution of customer tickets</p>

            <div className="space-y-3 pt-2">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{cat.name}</span>
                    <span className="text-slate-800 font-bold">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hindsight Long-Term Memory Impact Banner */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Hindsight Impact Analysis</span>
            </div>
            <h3 className="text-lg font-bold">
              84% of returning customers avoided repetitive troubleshooting
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              By scoping persistent memories per customer, SupportMind recalls prior devices, tried fixes, and environmental variables seamlessly on repeat interactions.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-3xl font-black text-cyan-400">2.4x</div>
            <div className="text-xs text-indigo-200">Faster Resolution</div>
          </div>
        </div>
      </div>
    </div>
  );
}
