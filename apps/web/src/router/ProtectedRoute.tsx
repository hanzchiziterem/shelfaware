import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Permission, hasPermission } from '../config/permissions';
import { PATHS } from './paths';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission }) => {
  const { user, status } = useAuthStore();

  // If unauthenticated, redirect to login
  if (status === 'unauthenticated') {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  // Check role permissions if specified
  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

