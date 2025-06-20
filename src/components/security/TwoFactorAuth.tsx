import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export const TwoFactorAuth: React.FC = () => {
  const { user } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if 2FA is enabled
      // In Clerk, this would be: user.twoFactorEnabled
      // For demo purposes, check localStorage
      const enabled = localStorage.getItem(`2fa_enabled_${user.id}`) === 'true';
      setIsEnabled(enabled);
      setLoading(false);
    }
  }, [user]);

  const handleEnable2FA = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // In production, this would use Clerk's 2FA setup:
      // await user.createTOTP();
      
      // For demo purposes, simulate enabling 2FA
      localStorage.setItem(`2fa_enabled_${user.id}`, 'true');
      setIsEnabled(true);
      setShowSetup(false);
      
      alert('Two-factor authentication has been enabled successfully!');
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      alert('Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // In production, this would use Clerk's 2FA disable:
      // await user.disableTOTP();
      
      // For demo purposes, simulate disabling 2FA
      localStorage.removeItem(`2fa_enabled_${user.id}`);
      setIsEnabled(false);
      
      alert('Two-factor authentication has been disabled.');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      alert('Failed to disable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          isEnabled 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {!isEnabled ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication is currently disabled. Enable it to secure your account with an additional verification step.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-blue-900 text-sm">Benefits of 2FA:</h4>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Protects against unauthorized access</li>
              <li>• Required even if password is compromised</li>
              <li>• Works with authenticator apps like Google Authenticator</li>
              <li>• Industry standard security practice</li>
            </ul>
          </div>

          {!showSetup ? (
            <button
              onClick={() => setShowSetup(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Enable Two-Factor Authentication
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Setup Instructions</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>2. Scan the QR code with your authenticator app</li>
                  <li>3. Enter the 6-digit code from your app to verify</li>
                  <li>4. Save your backup codes in a secure location</li>
                </ol>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zM6 7v8h8V7H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">QR Code would appear here</p>
                <p className="text-xs text-gray-500 mt-1">
                  Manual entry key: DEMO-KEY-FOR-TESTING-ONLY
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-mono"
                  />
                  <button
                    onClick={handleEnable2FA}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSetup(false)}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel Setup
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication is enabled and protecting your account.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">Your account is protected</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => alert('Backup codes: DEMO1-DEMO2-DEMO3-DEMO4-DEMO5 (In production, these would be real backup codes)')}
              className="block w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              View Backup Codes
            </button>
            
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="block w-full text-left text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};