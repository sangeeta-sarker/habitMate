import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { TimeProvider } from './lib/timeContext';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { DashboardPage } from './pages/Dashboard';
import { CalendarPage } from './pages/Calendar';
import { HistoryPage } from './pages/History';
import { SocialPage } from './pages/Social';
import { AdminPage } from './pages/Admin';
import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <TimeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route path="/social" element={<PrivateRoute><SocialPage /></PrivateRoute>} />
            
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </TimeProvider>
    </AuthProvider>
  );
}
