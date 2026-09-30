import React, { useState } from 'react';
import { 
  Settings, 
  BrainCircuit, 
  Bell, 
  Shield, 
  Save, 
  Check, 
  Lock 
} from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';

export default function CustomerSettingsPage({ currentUser, onLogout }) {
  const [rememberHardware, setRememberHardware] = useState(true);
  const [rememberSolutions, setRememberSolutions] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
            <p className="text-xs text-slate-500 mt-1">Configure memory retention, notifications, and security</p>
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings successfully saved!</span>
          </div>
        )}

        {/* Memory Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hindsight Memory Preferences</h3>
              <p className="text-xs text-slate-500">Manage how SupportMind retains context across conversations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Remember Hardware & Environment</div>
                <div className="text-[11px] text-slate-500">Store registered operating system and device specifications for faster diagnoses</div>
              </div>
              <input
                type="checkbox"
                checked={rememberHardware}
                onChange={(e) => setRememberHardware(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Retain Verified Solutions</div>
                <div className="text-[11px] text-slate-500">Keep track of troubleshooting steps that worked or failed in prior conversations</div>
              </div>
              <input
                type="checkbox"
                checked={rememberSolutions}
                onChange={(e) => setRememberSolutions(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Control when and how you receive support updates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Email Alerts on Ticket Resolution</div>
                <div className="text-[11px] text-slate-500">Get notified via email when an agent or AI closes your open issue</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security & Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
              <p className="text-xs text-slate-500">Manage your password and token sessions</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Account Credentials</div>
              <div className="text-[11px] text-slate-500">Secure token authentication active</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              Protected
            </span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
