import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { UserRole } from '../../types/user';
import { rbacService, RolePermissions } from '../../services/rbacService';
import { ROUTES } from '../../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermission,
  fallbackPath = ROUTES.LOGIN,
  loadingComponent = <div>Loading...</div>
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  // Show loading while auth state is loading
  if (!isLoaded) {
    return <>{loadingComponent}</>;
  }

  // Redirect to login if authentication is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If no role or permission requirements, just check auth
  if (!requiredRole && !requiredPermission) {
    return <>{children}</>;
  }

  // For role/permission checks, we need user data
  // In a real app, this would come from your user profile service
  // For now, we'll use a mock user profile based on Clerk user
  const mockUserProfile = {
    id: user?.id || '',
    clerkId: user?.id || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: 'member' as UserRole, // This would come from your backend
    trainingCompleted: false,
    eligibilityDate: new Date(),
    groupMemberships: [],
    // ... other profile fields
  };

  // Check role requirement
  if (requiredRole && mockUserProfile.role !== requiredRole) {
    // Check if user has higher role
    if (!rbacService.isHigherRole(mockUserProfile.role, requiredRole)) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  // Check permission requirement
  if (requiredPermission && !rbacService.hasPermission(mockUserProfile.role, requiredPermission)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  children: React.ReactNode;
  userRole: UserRole;
  requiredPermission: keyof RolePermissions;
  fallbackComponent?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  userRole,
  requiredPermission,
  fallbackComponent = null
}) => {
  const hasPermission = rbacService.hasPermission(userRole, requiredPermission);
  
  return hasPermission ? <>{children}</> : <>{fallbackComponent}</>;
};

interface RoleGuardProps {
  children: React.ReactNode;
  userRole: UserRole;
  allowedRoles: UserRole[];
  fallbackComponent?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  userRole,
  allowedRoles,
  fallbackComponent = null
}) => {
  const hasRole = allowedRoles.includes(userRole);
  
  return hasRole ? <>{children}</> : <>{fallbackComponent}</>;
};