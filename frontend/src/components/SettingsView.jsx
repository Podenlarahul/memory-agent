import React, { useState } from 'react';
import { Settings, Shield, Cpu, Database, CheckCircle2, RefreshCw, Key, Server } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ hindsightStatus }) {
  const [healthData, setHealthData] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const res = await api.getHealth();
      setHealthData(res);
    } catch (e) {
      setHealthData({ status: 'error', error: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Environment configuration, security rules, and Hindsight Cloud diagnostic console.
          </p>
        </div>

        {/* Security Rule Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 flex items-start space-x-3">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-950">Security Rule Enforced</h4>
            <p className="leading-relaxed">
              API keys are strictly managed via server-side environment variables (`.env`). No raw secrets are bundled into the client build or displayed in logs.
            </p>
          </div>
        </div>

        {/* Hindsight Cloud Diagnostic Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hindsight Cloud Memory Integration</h3>
                <p className="text-xs text-slate-400">Official Python `hindsight-client` with multi-strategy retrieval</p>
              </div>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium">Hindsight Endpoint</span>
              <div className="font-mono text-slate-800 font-semibold truncate">
                https://api.hindsight.vectorize.io
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium">Primary Bank ID</span>
              <div className="font-mono text-indigo-700 font-semibold">
                SupportMind
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium">API Key Status</span>
              <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Configured (Masked on Server)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium">Customer Bank Partitioning</span>
              <div className="flex items-center space-x-1.5 text-blue-600 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Enabled (Per-Customer Bank Isolation)</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Result */}
          {healthData && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-slate-400">// Health Check Response:</div>
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
