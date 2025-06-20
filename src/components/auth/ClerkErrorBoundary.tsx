import React from 'react';
import { ClerkAPIError } from '@clerk/types';

interface ClerkErrorBoundaryState {
  hasError: boolean;
  error: Error | ClerkAPIError | null;
}

interface ClerkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | ClerkAPIError | null; reset: () => void }>;
}

export class ClerkErrorBoundary extends React.Component<
  ClerkErrorBoundaryProps,
  ClerkErrorBoundaryState
> {
  constructor(props: ClerkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ClerkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Clerk authentication error:', error, errorInfo);
    
    // In production, you would send this to your error tracking service
    if (this.isClerkError(error)) {
      this.handleClerkError(error as unknown as ClerkAPIError);
    }
  }

  isClerkError(error: Error): boolean {
    return error.name === 'ClerkAPIError' || error.message.includes('Clerk');
  }

  handleClerkError(error: ClerkAPIError) {
    // Log specific Clerk error details
    console.error('Clerk API Error:', {
      message: error.message,
      // Add other available properties if needed
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return <DefaultClerkErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | ClerkAPIError | null;
  reset: () => void;
}

const DefaultClerkErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => {
  const isNetworkError = error?.message.includes('network') || error?.message.includes('fetch');
  const isAuthError = error?.message.includes('auth') || error?.message.includes('sign');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Error' : 'Authentication Error'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isNetworkError
            ? 'Unable to connect to authentication service. Please check your internet connection and try again.'
            : isAuthError
            ? 'There was a problem with authentication. Please try signing in again.'
            : 'An unexpected error occurred. Please try again.'}
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export const useClerkErrorHandler = () => {
  const handleClerkError = (error: Error | ClerkAPIError) => {
    console.error('Clerk error:', error);
    
    // Check for specific error types
    if (error.message.includes('network')) {
      // Handle network errors
      alert('Network error. Please check your connection and try again.');
    } else if (error.message.includes('Invalid authentication')) {
      // Handle auth errors
      window.location.href = '/login';
    } else {
      // Generic error handling
      alert('An error occurred. Please try again.');
    }
  };

  return { handleClerkError };
};