import React, { useState } from 'react';
import { BrainCircuit, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6 text-center">
        {/* Brand Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">SupportMind</h1>
            <p className="text-[11px] text-blue-600 font-semibold">AI Customer Support Agent</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your account email to receive your password reset instructions</p>
        </div>

        {/* Mail Icon in Circle */}
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
          <Mail className="w-7 h-7" />
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl space-y-3 text-left">
            <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reset Link Ready</span>
            </div>
            <p className="leading-relaxed text-emerald-700">
              Password recovery instructions have been prepared for <strong className="text-emerald-900">{email}</strong>.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center block"
              >
                Proceed to Reset Password →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
