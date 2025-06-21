import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface ClerkAuthFormProps {
  mode: 'login' | 'register';
}

export const ClerkAuthForm: React.FC<ClerkAuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();

  console.log('ClerkAuthForm rendering with mode:', mode);

  // Custom appearance configuration for Clerk components
  const appearance = {
    elements: {
      rootBox: 'mx-auto',
      card: 'bg-white shadow-md rounded-lg',
      headerTitle: 'text-2xl font-bold text-gray-900',
      headerSubtitle: 'text-gray-600',
      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
      footerActionLink: 'text-blue-600 hover:text-blue-700',
      identityPreviewText: 'text-gray-700',
      identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
      formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      formFieldLabel: 'text-gray-700',
      formFieldHintText: 'text-gray-500',
      formFieldErrorText: 'text-red-600',
      dividerLine: 'bg-gray-300',
      dividerText: 'text-gray-500'
    }
  };

  const redirectUrl = ROUTES.DASHBOARD;

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p>Debug: ClerkAuthForm mode = {mode}</p>
        <p>Redirect URL: {redirectUrl}</p>
      </div>
      
      {mode === 'login' ? (
        <SignIn 
          appearance={appearance}
          redirectUrl={redirectUrl}
          afterSignInUrl={redirectUrl}
          signUpUrl={ROUTES.REGISTER}
        />
      ) : (
        <SignUp 
          appearance={appearance}
          redirectUrl={redirectUrl}
          afterSignUpUrl={redirectUrl}
          signInUrl={ROUTES.LOGIN}
          unsafeMetadata={{
            role: 'member'
          }}
        />
      )}
      
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};