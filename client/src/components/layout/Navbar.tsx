import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, ShieldAlert, User, LogOut, Menu, X, LayoutDashboard, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isCustomer, isProfessional, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-teal-400 group-hover:rotate-12 transition-transform duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-300 bg-clip-text text-transparent">
                FIXORA
              </span>
              <span className="text-[10px] font-semibold text-teal-400 tracking-wider uppercase -mt-1">
                Smart Assistance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/services"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Browse Services</span>
            </Link>

            <Link
              to="/emergency"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center space-x-2 border border-rose-500/20"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Emergency 24/7</span>
            </Link>

            {isAuthenticated && (
              <>
                {isCustomer && (
                  <Link
                    to="/customer/dashboard"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    <span>My Bookings</span>
                  </Link>
                )}

                {isProfessional && (
                  <Link
                    to="/pro/dashboard"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    <span>Pro Dashboard</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>Admin Control</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full border border-teal-400/40"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white leading-none">{user.fullName}</span>
                    <span className="text-[10px] text-teal-400 capitalize leading-none mt-0.5">{user.role.toLowerCase()}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn-secondary-glow px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary-glow px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Browse Services
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-rose-400 hover:bg-rose-500/10"
          >
            Emergency 24/7
          </Link>

          {isAuthenticated ? (
            <>
              {isCustomer && (
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
                >
                  My Bookings
                </Link>
              )}
              {isProfessional && (
                <Link
                  to="/pro/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
                >
                  Pro Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
                >
                  Admin Control Panel
                </Link>
              )}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{user?.fullName}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm font-semibold text-rose-400"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
