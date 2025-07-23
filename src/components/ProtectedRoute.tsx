import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../services/auth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();

  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If admin is required but user is not admin, redirect to home
  if (requireAdmin && !adminUser) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the protected component
  return <>{children}</>;
}
