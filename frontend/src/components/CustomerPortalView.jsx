import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Cpu, 
  Laptop, 
  Building,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerPortalView({
  customer,
  messages = [],
  onSendMessage,
  isLoading,
  latestRetainedMemory
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, false);
    setInputText('');
  };

  const demoCustomerChips = [
    "My Wi-Fi keeps disconnecting.",
    "I'm using a Dell XPS 15.",
    "It mostly happens during Zoom calls.",
    "My Wi-Fi problem is back.",
  ];

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
      {/* Customer Portal Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {customer?.avatar || 'CU'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-900 text-sm">{customer?.name}'s Support Portal</h2>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Isolated Customer Memory</span>
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Registered Device: <span className="font-mono text-slate-600">{customer?.device}</span> • Plan: {customer?.plan}
            </div>
          </div>
        </div>

        {/* Privacy & Bank Verification Badge */}
        <div className="flex items-center space-x-2 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Hindsight Bank: <strong className="font-mono text-slate-800">SupportMind-{customer?.id}</strong></span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto p-6 space-x-6 overflow-hidden">
        {/* Left Column: Chat Conversation */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>SupportMind AI Assistant:</strong> Welcome back, {customer?.name}. We remember your previous interactions on your {customer?.device} and will tailor our troubleshooting to your history without repeating past questions.
              </div>
            </div>

            {messages.map((msg, idx) => {
              const isCustomer = msg.sender === 'customer';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 px-1">
                    {isCustomer ? 'You' : 'SupportMind AI'} • {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                      isCustomer
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.message}</div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Recalling memories from Hindsight & generating answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Demo Chips */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Query:
            </span>
            {demoCustomerChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(chip);
                  onSendMessage(chip, false);
                }}
                className="shrink-0 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 text-xs transition-colors shadow-2xs font-medium"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask support about your hardware, Wi-Fi, or software issue..."
                className="flex-1 bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-xs transition-all active:scale-95"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer's Personal Support Status */}
        <div className="w-80 space-y-4 shrink-0">
          {/* Active Tickets Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Your Active Tickets</span>
            </h3>

            <div className="space-y-2">
              {(customer?.known_issues || []).map((issue, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{issue.title}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                      In Review
                    </span>
                  </div>
                  {issue.context && (
                    <div className="text-[11px] text-slate-500">{issue.context}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="bg-indigo-50/70 border border-indigo-200/70 p-5 rounded-2xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Hindsight Privacy Guard</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Your memory bank is isolated using Hindsight Bank Partitioning. No other customer can access your interaction logs or device specifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
