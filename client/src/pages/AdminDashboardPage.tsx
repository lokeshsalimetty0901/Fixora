import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Wrench,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiPatch } from '../services/apiClient';

export const AdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/api/admin/stats', token);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching stats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPro = async (proId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setActionLoading(proId);
      await apiPatch(`/api/admin/verify-pro/${proId}`, { status }, token);
      fetchAdminStats();
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await apiPost(
        '/api/categories',
        {
          name: newCatName,
          description: newCatDesc || 'Professional category service.',
          icon: 'Wrench',
        },
        token
      );

      setNewCatName('');
      setNewCatDesc('');
      alert('New Service Category added successfully!');
      fetchAdminStats();
    } catch (err: any) {
      alert('Error creating category: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Fixora Platform Administration</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time platform governance, professional application review, and service category management.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminStats}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Refresh Telemetry
        </button>
      </div>

      {/* Analytics Overview Cards */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-slate-400 space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading telemetry...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Platform Users</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Registered customers & pros</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Professionals</span>
                <Wrench className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-2xl font-extrabold text-teal-400">{stats?.totalPros || 0}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {stats?.pendingPros || 0} pending verification
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed Bookings</span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{stats?.completedBookings || 0}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Out of {stats?.totalBookings || 0} total requests</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Gross Platform Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400">${(stats?.totalRevenue || 0).toFixed(2)}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Processed payments</span>
            </div>
          </div>

          {/* Pending Verification Applications */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Professional Verification Applications</h2>
                <p className="text-xs text-slate-400">
                  Review qualifications and approve or reject technician background applications.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {stats?.pendingVerifications?.length || 0} Pending
              </span>
            </div>

            {!stats?.pendingVerifications || stats.pendingVerifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                <p className="text-sm font-semibold text-white">All Pending Applications Reviewed!</p>
                <p className="text-xs text-slate-500">There are no pending professional verification requests in the queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.pendingVerifications.map((pro: any) => (
                  <div
                    key={pro.id}
                    className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={pro.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${pro.user?.fullName}`}
                        alt={pro.user?.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-400/40"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{pro.user?.fullName}</h3>
                        <p className="text-xs text-slate-400">
                          {pro.user?.email} • Phone: {pro.user?.phone}
                        </p>
                        <p className="text-xs text-slate-300 mt-1 italic font-light">"{pro.bio}"</p>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                          <span>Hourly: ${pro.hourlyRate}/hr</span>
                          <span>•</span>
                          <span>Address: {pro.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleVerifyPro(pro.id, 'VERIFIED')}
                        disabled={actionLoading === pro.id}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Application</span>
                      </button>

                      <button
                        onClick={() => handleVerifyPro(pro.id, 'REJECTED')}
                        disabled={actionLoading === pro.id}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-slate-800 hover:bg-rose-500/10 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Category Creator */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Add New Service Category</h2>
            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Solar Panel Fix)"
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short Description"
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
