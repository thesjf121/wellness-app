import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? 'Welcome back to your wellness journey' 
              : 'Start your wellness journey today'
            }
          </p>
        </div>
        
        <div className="mt-8">
          {mode === 'login' ? (
            <SignIn 
              redirectUrl={ROUTES.DASHBOARD}
              signUpUrl={ROUTES.REGISTER}
            />
          ) : (
            <SignUp 
              redirectUrl={ROUTES.DASHBOARD}
              signInUrl={ROUTES.LOGIN}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;