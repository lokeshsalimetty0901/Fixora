import React from 'react';
import { User, Phone, Mail, ShieldCheck, MapPin, Calendar, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b border-slate-800 pb-6">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
            alt={user.fullName}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-500/30 shadow-xl"
          />
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{user.fullName}</h1>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 capitalize">
              {user.role.toLowerCase()} Account
            </span>
            <p className="text-xs text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Email Address</span>
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="space-y-1 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Contact</span>
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Phone className="w-4 h-4 text-teal-400" />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        {user.professionalProfile && (
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-teal-400">Professional Partner Details</h2>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300 italic">"{user.professionalProfile.bio}"</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-500">Hourly Base Rate</span>
                  <span className="font-bold text-white">${user.professionalProfile.hourlyRate}/hr</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Verification</span>
                  <span className="font-bold text-teal-400">{user.professionalProfile.isVerified}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Operating Address</span>
                  <span className="font-bold text-white">{user.professionalProfile.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
