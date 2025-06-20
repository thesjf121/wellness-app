import React from 'react';
import { ClerkAuthForm } from '../../components/auth/ClerkAuthForm';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ClerkAuthForm mode={mode} />
      </div>
    </div>
  );
};

export default AuthPage;