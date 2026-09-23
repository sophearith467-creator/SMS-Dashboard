import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import type { Role } from '../../types/auth';
import { isStaffOnly } from '../../lib/roles';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, isBootstrapping, can, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2Icon size={22} className="animate-spin text-brand" aria-label="Loading session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Pure staff users are not allowed in the web dashboard
  if (isStaffOnly(user?.roles ?? [])) {
    return <Navigate to="/mobile-only" replace />;
  }

  if (!can(roles)) {
    return (
      <div className="rounded-2xl border border-line bg-surface shadow-soft">
        <EmptyState
          icon={ShieldAlertIcon}
          title="You don't have access to this area"
          description="This section is restricted to specific roles. Ask an administrator if you need access to it."
          action={
            <Button variant="secondary" onClick={() => window.history.back()}>
              Go back
            </Button>
          }
        />
      </div>
    );
  }

  return <Outlet />;
}
