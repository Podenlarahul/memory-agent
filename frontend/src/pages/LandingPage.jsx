import React from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Zap,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    'Remembers customer history',
    'Learns from every interaction',
    'Faster resolution',
    'Personalized support'
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-blue-50/30 to-white text-slate-800 flex flex-col justify-between">
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">SupportMind</span>
            <div className="text-[10px] text-blue-600 font-semibold tracking-wide">AI Customer Support Agent</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-4 py-2 rounded-xl transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 lg:py-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Support that remembers. Powered by Hindsight Cloud</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Smarter Support <br />
            with <span className="text-blue-600">Memory</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
            An AI support agent that remembers your customers, learns from every interaction, and provides personalized solutions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Sign In to Portal</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Support Mascot / Modern SaaS Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Glowing Backdrop */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-400/20 to-indigo-500/20 rounded-3xl blur-2xl transform rotate-3" />

            <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">SupportMind AI</div>
                    <div className="text-[10px] text-emerald-600 flex items-center space-x-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Hindsight Memory Active</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Live Agent
                </span>
              </div>

              {/* Chat Simulation Snippet */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-100 rounded-2xl rounded-tl-xs p-3 text-slate-700">
                  <p className="font-medium text-[11px] text-blue-600 mb-1">SupportMind AI</p>
                  Hello! How can I help with your system or network today?
                </div>

                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3 ml-6">
                  My Wi-Fi keeps disconnecting during evening video calls.
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl rounded-tl-xs p-3 text-indigo-900">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-700 mb-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Recalled from Hindsight:</span>
                  </div>
                  "I remember our previous discussion regarding your Wi-Fi issues on your Dell XPS 15. The previous driver update only provided temporary relief..."
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Autonomous Long-Term Recall</span>
                <span className="text-blue-600 font-semibold">Zero repetitive questions</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        SupportMind • AI Customer Support Agent with Long-Term Memory • HackWithHyderabad 3.0
      </footer>
    </div>
  );
}
