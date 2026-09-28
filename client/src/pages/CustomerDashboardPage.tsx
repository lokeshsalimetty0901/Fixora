import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Search,
  PlusCircle,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/apiClient';
import type { Booking } from '../types';

export const CustomerDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Booking[]>('/api/bookings', token);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const activeBookings = bookings.filter((b) =>
    ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status)
  );

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.totalPrice : 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_THE_WAY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>En Route</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1">
            <Wrench className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`}
            alt={user?.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/50 shadow-lg"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.fullName}!</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage your active service requests and track technician arrival live.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/emergency"
            className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all flex items-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>24/7 Emergency Dispatch</span>
          </Link>
          <Link
            to="/services"
            className="px-5 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Service</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{bookings.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Lifetime requests</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dispatches</span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{activeBookings.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Pros on the way or in progress</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{completedBookings.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Successfully resolved</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Amount Spent</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-teal-400">${totalSpent.toFixed(2)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Paid via secure mock payment</span>
        </div>
      </div>

      {/* Quick Service Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Need Immediate Assistance?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/services?category=auto-mechanic')}
            className="p-4 rounded-2xl glass-card hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300">Auto Mechanic</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Jumpstart & tire fix</p>
          </button>

          <button
            onClick={() => navigate('/services?category=electrician')}
            className="p-4 rounded-2xl glass-card hover:border-yellow-500/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-yellow-300">Electrician</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Breaker & wiring fix</p>
          </button>

          <button
            onClick={() => navigate('/services?category=plumbing')}
            className="p-4 rounded-2xl glass-card hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">Plumber</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Pipe leak & unclog</p>
          </button>

          <button
            onClick={() => navigate('/services?category=ac-repair')}
            className="p-4 rounded-2xl glass-card hover:border-teal-500/40 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300">AC Repair</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Gas refill & cooling</p>
          </button>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Service Bookings</h2>
            <p className="text-xs text-slate-400">View current status, live technician tracking, and past receipts.</p>
          </div>
          <button onClick={fetchBookings} className="text-xs font-semibold text-teal-400 hover:underline">
            Refresh List
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't requested any service pros yet. Browse categories or use emergency dispatch.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-white">
                      {booking.service?.name || 'Local Assistance Service'}
                    </span>
                    {getStatusBadge(booking.status)}
                    {booking.isEmergency && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        EMERGENCY
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Pro: {booking.professional?.user?.fullName || 'Assigned Specialist'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{booking.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{booking.scheduledDate} ({booking.scheduledTime})</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      Note: "{booking.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Paid</span>
                    <span className="text-base font-extrabold text-teal-400">${booking.totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/booking/track/${booking.id}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
