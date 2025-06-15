import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { User } from '../types';
import { apiService } from './api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isSignedIn: boolean;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileData?: {
    dateOfBirth?: Date;
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    primaryGoals?: ('weight_loss' | 'fitness' | 'nutrition' | 'social')[];
  };
}

class AuthService {
  async createUserProfile(userData: UserRegistrationData): Promise<User | null> {
    try {
      const response = await apiService.post<User>('/users/profile', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profile: userData.profileData || {
          activityLevel: 'moderately_active',
          primaryGoals: ['fitness']
        },
        goals: {
          dailySteps: 8000
        },
        role: 'member',
        trainingCompleted: false,
        eligibilityDate: null,
        groupMemberships: []
      });

      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to create user profile');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await apiService.put<User>(`/users/${userId}`, updates);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to update user profile');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await apiService.get<User>(`/users/${userId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async checkEligibilityStatus(userId: string): Promise<{
    eligible: boolean;
    daysActive: number;
    trainingCompleted: boolean;
    missingRequirements: string[];
  }> {
    try {
      const response = await apiService.get<{
        eligible: boolean;
        daysActive: number;
        trainingCompleted: boolean;
        missingRequirements: string[];
      }>(`/users/${userId}/eligibility`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        eligible: false,
        daysActive: 0,
        trainingCompleted: false,
        missingRequirements: ['Unable to check requirements']
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        eligible: false,
        daysActive: 0,
        trainingCompleted: false,
        missingRequirements: ['Error checking requirements']
      };
    }
  }

  async deleteAccount(userId: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`/users/${userId}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  convertClerkUserToAuthUser(clerkUser: any): AuthUser | null {
    if (!clerkUser) return null;

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      profilePicture: clerkUser.profileImageUrl,
      isSignedIn: true
    };
  }

  async syncClerkUserWithBackend(clerkUser: any): Promise<User | null> {
    if (!clerkUser) return null;

    try {
      // Check if user already exists in our backend
      let user = await this.getUserProfile(clerkUser.id);
      
      if (!user) {
        // Create new user profile
        user = await this.createUserProfile({
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          password: '', // Not needed for Clerk users
        });
      }

      return user;
    } catch (error) {
      console.error('Error syncing Clerk user with backend:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

// Custom hook to get current auth state
export function useAuth() {
  const { isSignedIn, userId, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();

  const authUser = clerkUser ? authService.convertClerkUserToAuthUser(clerkUser) : null;

  return {
    isSignedIn: isSignedIn && isLoaded,
    isLoading: !isLoaded,
    user: authUser,
    userId,
    signOut,
    clerkUser
  };
}

// Custom hook for user profile data
export function useUserProfile() {
  const { user, isSignedIn } = useAuth();
  
  // This would typically use React Query or similar for data fetching
  // For now, returning placeholder
  return {
    profile: null as User | null,
    isLoading: false,
    error: null,
    refetch: () => {},
    updateProfile: async (updates: Partial<User>) => {
      if (user) {
        return authService.updateUserProfile(user.id, updates);
      }
      return null;
    }
  };
}