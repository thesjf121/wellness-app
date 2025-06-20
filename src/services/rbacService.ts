// Role-based access control service

import { UserRole, UserProfile } from '../types/user';

export interface RolePermissions {
  // User management
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewAllUsers: boolean;
  
  // Group management
  canCreateGroups: boolean;
  canEditAnyGroup: boolean;
  canDeleteAnyGroup: boolean;
  canViewAllGroups: boolean;
  canManageOwnGroup: boolean;
  canJoinGroups: boolean;
  
  // Content management
  canCreateTrainingContent: boolean;
  canEditTrainingContent: boolean;
  canDeleteTrainingContent: boolean;
  canUploadWelcomeVideos: boolean;
  
  // Data access
  canViewUserAnalytics: boolean;
  canExportUserData: boolean;
  canViewSystemLogs: boolean;
  
  // System administration
  canManageRoles: boolean;
  canManageSystemSettings: boolean;
  canAccessAdminPanel: boolean;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  member: {
    // User management
    canCreateUsers: false,
    canEditUsers: false, // Can only edit their own profile
    canDeleteUsers: false,
    canViewAllUsers: false,
    
    // Group management
    canCreateGroups: false, // Must be eligible (7 days + training)
    canEditAnyGroup: false,
    canDeleteAnyGroup: false,
    canViewAllGroups: true,
    canManageOwnGroup: false,
    canJoinGroups: true,
    
    // Content management
    canCreateTrainingContent: false,
    canEditTrainingContent: false,
    canDeleteTrainingContent: false,
    canUploadWelcomeVideos: false,
    
    // Data access
    canViewUserAnalytics: false, // Can only view their own stats
    canExportUserData: false, // Can only export their own data
    canViewSystemLogs: false,
    
    // System administration
    canManageRoles: false,
    canManageSystemSettings: false,
    canAccessAdminPanel: false
  },
  
  team_sponsor: {
    // User management
    canCreateUsers: false,
    canEditUsers: false, // Can only edit their own profile
    canDeleteUsers: false,
    canViewAllUsers: false, // Can only view their group members
    
    // Group management
    canCreateGroups: true, // If eligible (7 days + training)
    canEditAnyGroup: false,
    canDeleteAnyGroup: false,
    canViewAllGroups: true,
    canManageOwnGroup: true, // Can manage groups they sponsor
    canJoinGroups: true,
    
    // Content management
    canCreateTrainingContent: false,
    canEditTrainingContent: false,
    canDeleteTrainingContent: false,
    canUploadWelcomeVideos: true, // For their groups
    
    // Data access
    canViewUserAnalytics: true, // For their group members only
    canExportUserData: false, // Can export their group's data
    canViewSystemLogs: false,
    
    // System administration
    canManageRoles: false,
    canManageSystemSettings: false,
    canAccessAdminPanel: false
  },
  
  super_admin: {
    // User management
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllUsers: true,
    
    // Group management
    canCreateGroups: true,
    canEditAnyGroup: true,
    canDeleteAnyGroup: true,
    canViewAllGroups: true,
    canManageOwnGroup: true,
    canJoinGroups: true,
    
    // Content management
    canCreateTrainingContent: true,
    canEditTrainingContent: true,
    canDeleteTrainingContent: true,
    canUploadWelcomeVideos: true,
    
    // Data access
    canViewUserAnalytics: true,
    canExportUserData: true,
    canViewSystemLogs: true,
    
    // System administration
    canManageRoles: true,
    canManageSystemSettings: true,
    canAccessAdminPanel: true
  }
};

class RBACService {
  /**
   * Check if user has a specific permission
   */
  hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
    return ROLE_PERMISSIONS[userRole][permission];
  }

  /**
   * Get all permissions for a user role
   */
  getRolePermissions(userRole: UserRole): RolePermissions {
    return ROLE_PERMISSIONS[userRole];
  }

  /**
   * Check if user can create groups (requires 7 days + training completion)
   */
  canUserCreateGroups(user: UserProfile): boolean {
    const hasRolePermission = this.hasPermission(user.role, 'canCreateGroups');
    
    if (!hasRolePermission) {
      return false;
    }

    // Check if user has completed training
    if (!user.trainingCompleted) {
      return false;
    }

    // Check if user has been active for 7 days
    if (!user.eligibilityDate) {
      return false;
    }

    const eligibilityDate = new Date(user.eligibilityDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - eligibilityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
  }

  /**
   * Check if user can manage a specific group
   */
  canUserManageGroup(user: UserProfile, groupId: string, groupSponsorId: string): boolean {
    // Super admins can manage any group
    if (user.role === 'super_admin') {
      return true;
    }

    // Team sponsors can manage their own groups
    if (user.role === 'team_sponsor' && user.id === groupSponsorId) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can view another user's profile
   */
  canViewUserProfile(requestingUser: UserProfile, targetUserId: string, groupContext?: string): boolean {
    // Users can always view their own profile
    if (requestingUser.id === targetUserId) {
      return true;
    }

    // Super admins can view any profile
    if (requestingUser.role === 'super_admin') {
      return true;
    }

    // Team sponsors can view profiles of their group members
    if (requestingUser.role === 'team_sponsor' && groupContext) {
      return requestingUser.groupMemberships.includes(groupContext);
    }

    // Members can view profiles of users in their groups
    if (groupContext && requestingUser.groupMemberships.includes(groupContext)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can access admin features
   */
  canAccessAdminPanel(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'canAccessAdminPanel');
  }

  /**
   * Get user's effective permissions based on role and context
   */
  getUserEffectivePermissions(user: UserProfile, context?: { groupId?: string }): RolePermissions & {
    canCreateGroupsNow: boolean;
    isGroupSponsor: boolean;
  } {
    const basePermissions = this.getRolePermissions(user.role);
    
    return {
      ...basePermissions,
      canCreateGroupsNow: this.canUserCreateGroups(user),
      isGroupSponsor: user.role === 'team_sponsor' || user.role === 'super_admin'
    };
  }

  /**
   * Validate role assignment
   */
  canAssignRole(assigningUserRole: UserRole, targetRole: UserRole): boolean {
    // Only super admins can assign roles
    if (assigningUserRole !== 'super_admin') {
      return false;
    }

    // Super admins can assign any role
    return true;
  }

  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  getRoleLevel(role: UserRole): number {
    switch (role) {
      case 'member':
        return 1;
      case 'team_sponsor':
        return 2;
      case 'super_admin':
        return 3;
      default:
        return 0;
    }
  }

  /**
   * Check if one role has higher permissions than another
   */
  isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return this.getRoleLevel(role1) > this.getRoleLevel(role2);
  }
}

// Create singleton instance
export const rbacService = new RBACService();

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  member: 'Member',
  team_sponsor: 'Team Sponsor',
  super_admin: 'Super Admin'
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  member: 'Can participate in groups, track wellness activities, and complete training modules.',
  team_sponsor: 'Can create and manage wellness groups, upload welcome videos, and view group analytics.',
  super_admin: 'Full system access including user management, content creation, and system administration.'
};

export default rbacService;