import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logUserAction } from '../services/errorService';

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'team_sponsor' | 'super_admin';
  profile?: {
    dateOfBirth?: string;
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    primaryGoals?: string[];
    dailyStepGoal?: number;
    dailyCalorieGoal?: number;
  };
  trainingCompleted?: boolean;
  eligibilityDate?: string;
  groupMemberships?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => void;
  updateUser: (updates: Partial<MockUser>) => void;
  refreshAuth: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = () => {
      const session = localStorage.getItem('wellness_app_session');
      const userData = localStorage.getItem('wellness_app_user');

      console.log('MockAuthContext checking session:', { session, userData });

      if (session && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('MockAuthContext setting user:', parsedUser);
          setUser(parsedUser);
          logUserAction('session_restored', { userId: parsedUser.id });
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('wellness_app_session');
          localStorage.removeItem('wellness_app_user');
        }
      }
      setIsLoaded(true);
    };

    checkSession();
  }, []);

  const refreshAuth = () => {
    const session = localStorage.getItem('wellness_app_session');
    const userData = localStorage.getItem('wellness_app_user');

    console.log('Refreshing auth state:', { session, userData });

    if (session && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Setting user from refresh:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data on refresh:', error);
        localStorage.removeItem('wellness_app_session');
        localStorage.removeItem('wellness_app_user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const signOut = () => {
    localStorage.removeItem('wellness_app_session');
    localStorage.removeItem('wellness_app_user');
    setUser(null);
    logUserAction('logout');
  };

  const updateUser = (updates: Partial<MockUser>) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      setUser(updatedUser);
      localStorage.setItem('wellness_app_user', JSON.stringify(updatedUser));
      logUserAction('profile_updated', { updates: Object.keys(updates) });
    }
  };

  const value: MockAuthContextType = {
    user,
    isLoaded,
    isSignedIn: !!user,
    signOut,
    updateUser,
    refreshAuth
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Hook that works with both Clerk and Mock auth
export const useWellnessAuth = () => {
  const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  const shouldUseClerk = clerkPubKey && clerkPubKey.startsWith('pk_test_') && !clerkPubKey.includes('dummy');
  
  // Always call the mock hook to maintain hook order
  const mockAuth = useMockAuth();

  if (shouldUseClerk) {
    // Import Clerk hooks dynamically when needed
    // This will be implemented when we have real Clerk keys
    return {
      user: null,
      isLoaded: true,
      isSignedIn: false,
      signOut: () => {},
      updateUser: () => {}
    };
  } else {
    return mockAuth;
  }
};