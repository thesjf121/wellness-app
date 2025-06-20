import React, { useState } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { groupService } from '../../services/groupService';
import { JoinGroupRequest, EligibilityCheck, Group } from '../../types/groups';
import { GroupCapacityIndicator } from './GroupCapacityIndicator';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: (groupId: string) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupJoined
}) => {
  const { user } = useMockAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [groupPreview, setGroupPreview] = useState<Group | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && user) {
      checkEligibility();
    }
  }, [isOpen, user]);

  const checkEligibility = async () => {
    if (!user) return;

    try {
      const check = await groupService.checkEligibility(user.id);
      setEligibility(check);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      setError('Failed to check eligibility');
    }
  };

  const previewGroup = async (code: string) => {
    if (!code || code.length !== 6) {
      setGroupPreview(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const group = await groupService.getGroupByInviteCode(code);
      setGroupPreview(group);
      setError(null);
    } catch (error) {
      console.error('Failed to preview group:', error);
      setGroupPreview(null);
      // Don't show error for preview, only for actual join attempt
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const request: JoinGroupRequest = {
        inviteCode: inviteCode.trim().toUpperCase(),
        message: message.trim()
      };

      const result = await groupService.joinGroup(request, user.id);
      onGroupJoined(result.group.id);
      onClose();
      
      // Reset form
      setInviteCode('');
      setMessage('');
      setGroupPreview(null);
    } catch (error) {
      console.error('Failed to join group:', error);
      setError(error instanceof Error ? error.message : 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const formatInviteCode = (value: string) => {
    // Format as XXX-XXX for better readability
    const clean = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInviteCode(e.target.value);
    const cleanCode = formatted.replace('-', '');
    
    if (cleanCode.length <= 6) {
      setInviteCode(formatted);
      
      // Preview group when code is complete
      if (cleanCode.length === 6) {
        previewGroup(cleanCode);
      } else {
        setGroupPreview(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Join Group with Invite Code</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-blue-900">✅ You can join any group!</h3>
            <p className="text-blue-800 text-sm">
              Simply enter the 6-character invite code from a group sponsor to join their accountability group.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Ask a group sponsor for their 6-character invite code to join their group.
                </p>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={handleInviteCodeChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-wider"
                  placeholder="XXX-XXX"
                  maxLength={7} // Including the dash
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-character code shared by the group sponsor
                </p>
              </div>

              {/* Group Preview */}
              {previewLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 text-sm">Looking up group...</span>
                  </div>
                </div>
              )}

              {groupPreview && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{groupPreview.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{groupPreview.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      groupPreview.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {groupPreview.status}
                    </span>
                  </div>

                  {/* Group Capacity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Group Capacity</h4>
                    <GroupCapacityIndicator
                      currentMembers={groupPreview.currentMemberCount}
                      maxMembers={groupPreview.maxMembers}
                      size="small"
                    />
                  </div>

                  {/* Group Goals */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Group Goals</h4>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      <div>📊 Daily Steps: {groupPreview.settings.activityGoals.dailyStepsGoal.toLocaleString()}</div>
                      <div>🍎 Weekly Food Entries: {groupPreview.settings.activityGoals.weeklyFoodEntriesGoal}</div>
                      <div>📚 Monthly Training: {groupPreview.settings.activityGoals.monthlyTrainingModulesGoal} modules</div>
                    </div>
                  </div>

                  {/* Group Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Group Settings</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {groupPreview.settings.isPublic && (
                        <div className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>Publicly discoverable</span>
                        </div>
                      )}
                      {groupPreview.settings.requireApproval && (
                        <div className="flex items-center space-x-1">
                          <span>✋</span>
                          <span>Requires sponsor approval</span>
                        </div>
                      )}
                      {groupPreview.settings.allowMemberInvites && (
                        <div className="flex items-center space-x-1">
                          <span>👥</span>
                          <span>Members can invite others</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {groupPreview && groupPreview.currentMemberCount >= groupPreview.maxMembers && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">🚫</span>
                    <div>
                      <p className="text-red-800 font-medium text-sm">Group is Full</p>
                      <p className="text-red-700 text-xs">This group has reached its maximum capacity of {groupPreview.maxMembers} members.</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce yourself to the group..."
                  rows={3}
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/150 characters
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-1">What to expect:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your wellness journey with up to 9 others</li>
                  <li>• Get support and accountability from teammates</li>
                  <li>• Track group progress and achievements</li>
                  <li>• Participate in group challenges</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    loading || 
                    !inviteCode.replace('-', '').length || 
                    !!(groupPreview && groupPreview.currentMemberCount >= groupPreview.maxMembers)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium"
                >
                  {loading ? 'Joining...' : 'Join Group'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};