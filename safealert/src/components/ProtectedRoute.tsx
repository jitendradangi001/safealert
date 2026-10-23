import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

export function ProtectedRoute({ children, requireRole }: { children: ReactNode; requireRole?: UserRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireRole && profile && profile.role !== requireRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-800">Access restricted</p>
          <p className="mt-1 text-sm text-slate-500">
            This page is for {requireRole === 'admin' ? 'Monitoring/Admin' : 'Mobile User'} accounts.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
