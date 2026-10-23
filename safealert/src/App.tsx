import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import MobileEmergencyPage from '@/pages/mobile/MobileEmergencyPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AlertHistoryPage from '@/pages/dashboard/AlertHistoryPage';
import DemoModePage from '@/pages/dashboard/DemoModePage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/mobile"
          element={
            <ProtectedRoute requireRole="mobile_user">
              <MobileEmergencyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute requireRole="admin">
              <AlertHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/demo"
          element={
            <ProtectedRoute requireRole="admin">
              <DemoModePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}
