import React, { useState, useEffect } from 'react';
import { foodService } from '../../services/foodService';

export const OfflineIndicator: React.FC = () => {
  const [offlineStatus, setOfflineStatus] = useState({ count: 0, isOnline: true });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const status = foodService.getOfflineQueueStatus();
      setOfflineStatus(status);
    };

    // Initial check
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check for queue changes
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await foodService.forceSync();
      // Update status after sync
      const status = foodService.getOfflineQueueStatus();
      setOfflineStatus(status);
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Don't show anything if online and no pending items
  if (offlineStatus.isOnline && offlineStatus.count === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-lg max-w-sm ${
      offlineStatus.isOnline ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    } border p-3`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {offlineStatus.isOnline ? (
            offlineStatus.count > 0 ? (
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              offlineStatus.isOnline ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {offlineStatus.isOnline ? 'Pending Sync' : 'Offline'}
            </p>
            
            {offlineStatus.isOnline && offlineStatus.count > 0 && (
              <button
                onClick={handleForceSync}
                disabled={syncing}
                className="ml-2 text-xs bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-2 py-1 rounded"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
          
          <p className={`text-xs mt-1 ${
            offlineStatus.isOnline ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {offlineStatus.isOnline ? (
              offlineStatus.count > 0 ? (
                `${offlineStatus.count} item${offlineStatus.count !== 1 ? 's' : ''} waiting to sync`
              ) : (
                'All items synchronized'
              )
            ) : (
              offlineStatus.count > 0 ? (
                `${offlineStatus.count} item${offlineStatus.count !== 1 ? 's' : ''} saved locally`
              ) : (
                'Working offline - changes will sync when online'
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
};