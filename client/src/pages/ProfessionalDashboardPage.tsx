import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Power,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Star,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../services/apiClient';
import type { Booking } from '../types';

export const ProfessionalDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.professionalProfile?.isAvailable ?? true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProBookings();
  }, []);

  const fetchProBookings = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Booking[]>('/api/bookings', token);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const data = await apiPatch<{ isAvailable: boolean }>('/api/professionals/toggle-availability', undefined, token);
      setIsAvailable(data.isAvailable);
    } catch (err: any) {
      alert('Could not toggle availability: ' + err.message);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      setActionLoading(bookingId);
      await apiPatch(`/api/bookings/${bookingId}/status`, { status: newStatus }, token);
      fetchProBookings();
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const proProfile = user?.professionalProfile;
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedJobs.reduce((sum, b) => sum + b.totalPrice * 0.85, 0); // 85% payout after platform fee

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Pro Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`}
            alt={user?.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg"
          />
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{user?.fullName}</h1>
              {proProfile?.isVerified === 'VERIFIED' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Partner</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Verification Pending</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Base Location: {proProfile?.address || 'City Center'} • Rate: ${proProfile?.hourlyRate || 65}/hr
            </p>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div className="flex items-center space-x-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white">Dispatch Status</span>
            <span className={`text-[11px] font-semibold ${isAvailable ? 'text-teal-400' : 'text-slate-500'}`}>
              {isAvailable ? '● ONLINE (Accepting Calls)' : '○ OFFLINE'}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
              isAvailable ? 'bg-teal-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Pro Earnings & Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Earnings</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-teal-400">${totalEarnings.toFixed(2)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">After 15% platform commission</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{pendingRequests.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting your response</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dispatches</span>
            <Navigation className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-400">{activeJobs.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">En route or in progress</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Partner Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{proProfile?.rating || 4.9} / 5.0</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Based on customer reviews</span>
        </div>
      </div>

      {/* Active Jobs Queue & Dispatch Controls */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Dispatches & Job Requests</h2>
            <p className="text-xs text-slate-400">Accept incoming customer bookings and update job step status in real-time.</p>
          </div>
          <button onClick={fetchProBookings} className="text-xs font-semibold text-teal-400 hover:underline">
            Refresh Queue
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading dispatch queue...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Dispatch Requests</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Keep your status ONLINE to receive real-time notifications for nearby emergency and routine requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-5 rounded-2xl glass-card border ${
                  booking.isEmergency ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-white">
                      {booking.service?.name || 'Local Assistance Service'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      {booking.status}
                    </span>
                    {booking.isEmergency && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                        24/7 EMERGENCY
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      <span>Customer: {booking.customer?.fullName || 'Sarah Jenkins'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{booking.customer?.phone || '+1 (555) 234-5678'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{booking.address}</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      Customer Problem Note: "{booking.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')}
                        disabled={actionLoading === booking.id}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
                      >
                        Accept Request (${booking.totalPrice})
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'REJECTED')}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-slate-800 hover:bg-rose-500/10"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'ON_THE_WAY')}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                    >
                      Start Navigation (On The Way)
                    </button>
                  )}

                  {booking.status === 'ON_THE_WAY' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500"
                    >
                      Arrived & Start Job
                    </button>
                  )}

                  {booking.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg"
                    >
                      Complete Job & Collect Payout
                    </button>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Job Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
