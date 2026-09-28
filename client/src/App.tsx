import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { ProfessionalDashboardPage } from './pages/ProfessionalDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ServicesPage } from './pages/ServicesPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/emergency" element={<ServicesPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Professional Routes */}
              <Route
                path="/pro/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['PROFESSIONAL']}>
                    <ProfessionalDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Administrator Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected General Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
