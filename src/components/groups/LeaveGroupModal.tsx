import React, { useState } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { groupService } from '../../services/groupService';
import { Group } from '../../types/groups';

interface LeaveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onGroupLeft: () => void;
}

export const LeaveGroupModal: React.FC<LeaveGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onGroupLeft
}) => {
  const { user } = useMockAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleLeaveGroup = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await groupService.leaveGroup(group.id, user.id, reason.trim());
      onGroupLeft();
      onClose();
      
      // Reset form
      setReason('');
    } catch (error) {
      console.error('Failed to leave group:', error);
      setError(error instanceof Error ? error.message : 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Leave Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-red-400 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Are you sure you want to leave?</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>You're about to leave <strong>{group.name}</strong>. This action will:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Remove you from all group activities and discussions</li>
                    <li>Clear your activity history within this group</li>
                    <li>Require a new invitation to rejoin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Optional reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for leaving (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Let the group sponsor know why you're leaving..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/200 characters
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleLeaveGroup}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium"
            >
              {loading ? 'Leaving...' : 'Leave Group'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 py-2 px-4 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveGroupModal;