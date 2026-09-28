import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/apiClient';
import type { AuthResponse } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiPost<AuthResponse>('/api/auth/login', { email, password });

      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response received from authentication server.');
      }

      login(data);

      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'PROFESSIONAL') {
        navigate('/pro/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-6 h-6 text-teal-400" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back to Fixora</h2>
          <p className="text-xs text-slate-400">Sign in to manage your bookings, service dispatches & profile</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div className="pt-4 border-t border-slate-800">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@fixora.com', 'Password123!')}
              className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center space-y-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pro@fixora.com', 'Password123!')}
              className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-indigo-400 transition-colors flex flex-col items-center space-y-1"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pro Partner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fixora.com', 'AdminPass123!')}
              className="py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-amber-400 transition-colors flex flex-col items-center space-y-1"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have a Fixora account?{' '}
          <Link to="/register" className="font-semibold text-teal-400 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
