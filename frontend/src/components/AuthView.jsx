import React, { useState } from 'react';
import { 
  BrainCircuit, 
  History, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@supportmind.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLoginSuccess(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    setError('');
    onLoginSuccess(demoEmail, 'password123')
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const features = [
    {
      icon: History,
      title: 'Remembers customer history',
      desc: 'Past issues, hardware profiles, and preferences retained via Hindsight.'
    },
    {
      icon: Sparkles,
      title: 'Learns over time',
      desc: 'Extracts useful long-term context from every ongoing conversation.'
    },
    {
      icon: Clock,
      title: 'Provides faster resolution',
      desc: 'Zero repetitive questions when returning customers report recurrent bugs.'
    },
    {
      icon: ShieldCheck,
      title: 'Improves customer satisfaction',
      desc: 'Strict per-customer memory isolation and personalized technical support.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Left Side: Product Showcase */}
        <div className="p-10 lg:p-12 bg-linear-to-b from-blue-600 to-indigo-700 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow circles */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          <div>
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">SupportMind</span>
                <div className="text-[11px] text-blue-200 font-medium">AI Customer Support Agent</div>
              </div>
            </div>

            {/* Catchphrase */}
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
              Smarter Support <br />
              with <span className="text-cyan-300 underline decoration-cyan-400/40 decoration-wavy">Memory</span>
            </h1>

            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              An AI customer support agent that remembers your customers, learns from past interactions, and provides personalized solutions using Hindsight.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start space-x-3 text-xs">
                    <div className="p-2 rounded-xl bg-white/10 border border-white/15 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{f.title}</div>
                      <div className="text-blue-200 text-xs mt-0.5 leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-8 border-t border-white/15 text-xs text-blue-200 italic mt-8">
            "Support that remembers. Customers that stay."
          </div>
        </div>

        {/* Right Side: Sign-in Form */}
        <div className="p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your SupportMind workspace or select a quick demo role.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <a href="#forgot" className="text-[11px] text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full text-xs text-slate-800 pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Logins for Hackathon Evaluator */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Instant Hackathon Demo Login
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@supportmind.ai')}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Support Agent / Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul@example.com')}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-800 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Customer: Rahul Sharma</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-6">
            HackWithHyderabad 3.0 • Powered by Hindsight Cloud Memory
          </div>
        </div>
      </div>
    </div>
  );
}
