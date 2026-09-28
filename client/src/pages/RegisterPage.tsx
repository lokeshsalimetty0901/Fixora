import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, User, Phone, MapPin, DollarSign, ArrowRight, AlertCircle, Loader2, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/apiClient';
import type { UserRole, AuthResponse } from '../types';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole: UserRole = searchParams.get('role') === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CUSTOMER';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Pro specific fields
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('65');
  const [address, setAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        phone,
        password,
        role,
      };

      if (role === 'PROFESSIONAL') {
        payload.bio = bio || 'Professional service partner.';
        payload.hourlyRate = Number(hourlyRate) || 60;
        payload.address = address || 'City Center';
        payload.experienceYears = Number(experienceYears) || 1;
      }

      const data = await apiPost<AuthResponse>('/api/auth/register', payload);

      if (!data || !data.token || !data.user) {
        throw new Error('Registration succeeded but received invalid session data.');
      }

      login(data);

      if (role === 'PROFESSIONAL') {
        navigate('/pro/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-xl w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Your Fixora Account</h2>
          <p className="text-xs text-slate-400">Join thousands of homeowners and technicians on Fixora</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'CUSTOMER'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('PROFESSIONAL')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'PROFESSIONAL'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Pro Service Partner</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Specific Fields */}
          {role === 'PROFESSIONAL' && (
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <span className="block text-xs font-bold text-teal-400 uppercase tracking-wider">
                Professional Service Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Hourly Rate ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="65"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="3"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Base Operating Address / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="742 Broadway, New York, NY"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Professional Bio / Qualifications Summary
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your technical certifications, specialties, and emergency availability..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-400 hover:underline">
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
