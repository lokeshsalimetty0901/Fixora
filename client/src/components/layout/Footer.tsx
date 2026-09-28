import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-teal-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">FIXORA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart local service & 24/7 emergency dispatch platform. Connecting verified technicians with nearby homeowners instantly.
            </p>
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Background Checked Professionals</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Services</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/services?category=auto-mechanic" className="hover:text-teal-300 transition-colors">Emergency Auto Mechanics</Link></li>
              <li><Link to="/services?category=electrician" className="hover:text-teal-300 transition-colors">Master Electricians</Link></li>
              <li><Link to="/services?category=plumbing" className="hover:text-teal-300 transition-colors">Plumbing & Water Leak Repair</Link></li>
              <li><Link to="/services?category=ac-repair" className="hover:text-teal-300 transition-colors">HVAC & Air Conditioning</Link></li>
              <li><Link to="/services?category=carpentry" className="hover:text-teal-300 transition-colors">Carpentry & Locksmith</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Professionals</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/register?role=PROFESSIONAL" className="hover:text-teal-300 transition-colors">Join as a Service Partner</Link></li>
              <li><Link to="/pro/verification" className="hover:text-teal-300 transition-colors">Pro Verification Guide</Link></li>
              <li><Link to="/pro/dashboard" className="hover:text-teal-300 transition-colors">Partner Dashboard</Link></li>
              <li><Link to="/pricing-calculator" className="hover:text-teal-300 transition-colors">Earnings & Commission Rates</Link></li>
            </ul>
          </div>

          {/* 24/7 Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Emergency Hotline</h3>
            <div className="p-4 rounded-xl glass-card border border-rose-500/30 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Toll-Free Emergency</span>
                <p className="text-sm font-bold text-white">+1 (800) 555-FIXORA</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Average dispatch response time: <span className="text-teal-400 font-semibold">&lt; 15 minutes</span>.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fixora Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
