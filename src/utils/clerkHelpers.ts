import { UserResource } from '@clerk/types';

export type UserRole = 'member' | 'team_sponsor' | 'super_admin';

/**
 * Get user role from Clerk user metadata
 * Role is stored in publicMetadata.role
 */
export const getUserRole = (user: UserResource | null | undefined): UserRole => {
  if (!user) return 'member';
  
  const role = user.publicMetadata?.role as UserRole | undefined;
  return role || 'member';
};

/**
 * Get user profile data from Clerk metadata
 * Profile data is stored in publicMetadata.profile
 */
export interface UserProfile {
  dailyStepGoal?: number;
  dailyCalorieGoal?: number;
  height?: number;
  weight?: number;
  preferredUnits?: 'metric' | 'imperial';
}

export const getUserProfile = (user: UserResource | null | undefined): UserProfile => {
  if (!user) return {};
  
  const profile = user.publicMetadata?.profile as UserProfile | undefined;
  return profile || {};
};

/**
 * Check if user has admin privileges
 */
export const isAdmin = (user: UserResource | null | undefined): boolean => {
  const role = getUserRole(user);
  return role === 'super_admin' || role === 'team_sponsor';
};

/**
 * Update user metadata in Clerk
 * Note: This requires a backend API call as client-side updates are limited
 */
export const updateUserMetadata = async (
  userId: string,
  metadata: {
    role?: UserRole;
    profile?: UserProfile;
  }
): Promise<void> => {
  // In production, this would call your backend API which uses Clerk's backend SDK
  // For now, we'll store in localStorage as a fallback
  const key = `user_metadata_${userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '{}');
  const updated = { ...existing, ...metadata };
  localStorage.setItem(key, JSON.stringify(updated));
};

/**
 * Get display name for user
 */
export const getUserDisplayName = (user: UserResource | null | undefined): string => {
  if (!user) return 'User';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  // Fallback to email prefix
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) {
    return email.split('@')[0];
  }
  
  return 'User';
};