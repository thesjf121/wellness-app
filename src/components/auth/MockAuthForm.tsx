import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { logUserAction } from '../../services/errorService';
import { useMockAuth } from '../../context/MockAuthContext';

interface MockAuthFormProps {
  mode: 'login' | 'register';
}

interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'team_sponsor' | 'super_admin';
  createdAt: string;
}

export const MockAuthForm: React.FC<MockAuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshAuth } = useMockAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Form submitted:', { mode, email, password });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mode === 'register') {
        // Mock user registration
        const newUser: MockUser = {
          id: `user_${Date.now()}`,
          email,
          firstName,
          lastName,
          role: 'member',
          createdAt: new Date().toISOString()
        };

        // Store mock user in localStorage
        localStorage.setItem('wellness_app_user', JSON.stringify(newUser));
        localStorage.setItem('wellness_app_session', 'mock_session_token');
        
        logUserAction('register', { email, role: 'member' });
      } else {
        // Mock user login - for development, we'll accept any credentials
        // In a real app, this would validate against the backend
        const mockUser: MockUser = {
          id: `user_${Date.now()}`,
          email,
          firstName: 'Test',
          lastName: 'User',
          role: 'member',
          createdAt: new Date().toISOString()
        };

        // Store mock user and session
        localStorage.setItem('wellness_app_user', JSON.stringify(mockUser));
        localStorage.setItem('wellness_app_session', 'mock_session_token');
        logUserAction('login', { email });
      }

      // Refresh auth state and navigate to dashboard
      refreshAuth();
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 100);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Development Mode - Mock Authentication
          </p>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              minLength={8}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <div className="text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.REGISTER)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};