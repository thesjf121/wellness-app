import React, { createContext, useContext, ReactNode } from 'react';

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'member' | 'team_sponsor' | 'super_admin';
  profile?: {
    dailyStepGoal?: number;
    dailyCalorieGoal?: number;
  };
}

interface MockAuthContextType {
  isSignedIn: boolean;
  user: MockUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

const defaultMockUser: MockUser = {
  id: 'test-user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'member',
  profile: {
    dailyStepGoal: 8000,
    dailyCalorieGoal: 2000
  }
};

export const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: true,
  user: defaultMockUser,
  signIn: async () => {},
  signOut: () => {},
  signUp: async () => {}
});

interface MockAuthProviderProps {
  children: ReactNode;
  initialUser?: MockUser | null;
  initialSignedIn?: boolean;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ 
  children, 
  initialUser = defaultMockUser, 
  initialSignedIn = true 
}) => {
  const [isSignedIn, setIsSignedIn] = React.useState(initialSignedIn);
  const [user, setUser] = React.useState<MockUser | null>(initialUser);

  const signIn = async (email: string, password: string) => {
    setUser(defaultMockUser);
    setIsSignedIn(true);
  };

  const signOut = () => {
    setUser(null);
    setIsSignedIn(false);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const newUser: MockUser = {
      id: `test-user-${Date.now()}`,
      firstName,
      lastName,
      email,
      role: 'member',
      profile: {
        dailyStepGoal: 8000,
        dailyCalorieGoal: 2000
      }
    };
    setUser(newUser);
    setIsSignedIn(true);
  };

  return (
    <MockAuthContext.Provider value={{
      isSignedIn,
      user,
      signIn,
      signOut,
      signUp
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuthForTesting = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuthForTesting must be used within a MockAuthProvider');
  }
  return context;
};