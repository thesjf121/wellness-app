import React, { useState } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { groupService } from '../../services/groupService';
import { CreateGroupRequest, EligibilityCheck } from '../../types/groups';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated
}) => {
  const { user } = useMockAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    requireApproval: false,
    allowMemberInvites: true,
    dailyStepsGoal: 8000,
    weeklyFoodEntriesGoal: 14,
    monthlyTrainingModulesGoal: 2
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Group name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      errors.name = 'Group name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }

    if (formData.dailyStepsGoal < 1000) {
      errors.dailyStepsGoal = 'Daily steps goal must be at least 1,000';
    } else if (formData.dailyStepsGoal > 50000) {
      errors.dailyStepsGoal = 'Daily steps goal must be less than 50,000';
    }

    if (formData.weeklyFoodEntriesGoal < 1) {
      errors.weeklyFoodEntriesGoal = 'Weekly food entries goal must be at least 1';
    } else if (formData.weeklyFoodEntriesGoal > 21) {
      errors.weeklyFoodEntriesGoal = 'Weekly food entries goal must be less than 21';
    }

    if (formData.monthlyTrainingModulesGoal < 0) {
      errors.monthlyTrainingModulesGoal = 'Monthly training goal cannot be negative';
    } else if (formData.monthlyTrainingModulesGoal > 8) {
      errors.monthlyTrainingModulesGoal = 'Monthly training goal must be less than 8';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eligibility?.canCreateGroup) return;

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const request: CreateGroupRequest = {
        name: formData.name,
        description: formData.description,
        settings: {
          isPublic: formData.isPublic,
          requireApproval: formData.requireApproval,
          allowMemberInvites: formData.allowMemberInvites,
          activityGoals: {
            dailyStepsGoal: formData.dailyStepsGoal,
            weeklyFoodEntriesGoal: formData.weeklyFoodEntriesGoal,
            monthlyTrainingModulesGoal: formData.monthlyTrainingModulesGoal
          },
          notifications: {
            newMemberJoins: true,
            memberAchievements: true,
            groupChallenges: true,
            inactiveMembers: true
          }
        }
      };

      const result = await groupService.createGroup(request, user.id);
      
      // Show the invite code to the user
      alert(`Group created successfully!\n\nYour invite code is: ${result.group.inviteCode}\n\nShare this code with others to invite them to your group.`);
      
      onGroupCreated(result.group.id);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        isPublic: false,
        requireApproval: false,
        allowMemberInvites: true,
        dailyStepsGoal: 8000,
        weeklyFoodEntriesGoal: 14,
        monthlyTrainingModulesGoal: 2
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to create group:', error);
      setError(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Eligibility Check */}
          {eligibility && (
            <div className={`rounded-lg p-4 mb-6 ${
              eligibility.canCreateGroup 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-2">
                {eligibility.canCreateGroup ? '✅ You\'re Eligible!' : '❌ Not Eligible Yet'}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className={`flex items-center space-x-2 ${
                  eligibility.requirements.sevenDayActivity.met ? 'text-green-700' : 'text-red-700'
                }`}>
                  <span>{eligibility.requirements.sevenDayActivity.met ? '✅' : '❌'}</span>
                  <span>
                    7-Day Activity: {eligibility.requirements.sevenDayActivity.daysActive}/7 days
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 ${
                  eligibility.requirements.trainingCompletion.met ? 'text-green-700' : 'text-red-700'
                }`}>
                  <span>{eligibility.requirements.trainingCompletion.met ? '✅' : '❌'}</span>
                  <span>
                    Training: {eligibility.requirements.trainingCompletion.modulesCompleted}/8 modules
                  </span>
                </div>
              </div>

              {!eligibility.canCreateGroup && (
                <p className="text-red-600 text-sm mt-2">
                  Complete the requirements above to create a group.
                </p>
              )}
            </div>
          )}

          {/* Form */}
          {eligibility?.canCreateGroup ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    validationErrors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter group name"
                  maxLength={50}
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    validationErrors.description 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Describe your group's goals and purpose"
                  rows={3}
                  maxLength={200}
                />
                {validationErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{formData.description.length}/200 characters</p>
              </div>

              {/* Activity Goals */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Activity Goals</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Steps Goal
                  </label>
                  <input
                    type="number"
                    value={formData.dailyStepsGoal}
                    onChange={(e) => setFormData({ ...formData, dailyStepsGoal: parseInt(e.target.value) || 0 })}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      validationErrors.dailyStepsGoal 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    min="1000"
                    max="50000"
                    placeholder="8000"
                  />
                  {validationErrors.dailyStepsGoal && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.dailyStepsGoal}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Recommended: 8,000-10,000 steps</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Food Entries Goal
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyFoodEntriesGoal}
                    onChange={(e) => setFormData({ ...formData, weeklyFoodEntriesGoal: parseInt(e.target.value) || 0 })}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      validationErrors.weeklyFoodEntriesGoal 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    min="1"
                    max="21"
                    placeholder="14"
                  />
                  {validationErrors.weeklyFoodEntriesGoal && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.weeklyFoodEntriesGoal}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Recommended: 14 entries (2 per day)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Training Modules Goal
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyTrainingModulesGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyTrainingModulesGoal: parseInt(e.target.value) || 0 })}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      validationErrors.monthlyTrainingModulesGoal 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    min="0"
                    max="8"
                    placeholder="2"
                  />
                  {validationErrors.monthlyTrainingModulesGoal && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.monthlyTrainingModulesGoal}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Recommended: 2 modules per month</p>
                </div>
              </div>

              {/* Group Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Group Settings</h4>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Make group publicly discoverable</span>
                      <p className="text-xs text-gray-500 mt-1">Others can find your group in search results (still requires invite code to join)</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Require approval for new members</span>
                      <p className="text-xs text-gray-500 mt-1">You must approve each person before they can join the group</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.allowMemberInvites}
                      onChange={(e) => setFormData({ ...formData, allowMemberInvites: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Allow members to invite others</span>
                      <p className="text-xs text-gray-500 mt-1">Group members can share the invite code with friends</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium"
                >
                  {loading ? 'Creating...' : 'Create Group'}
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
          ) : (
            <div className="text-center py-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Building Your Foundation!</h3>
                <p className="text-gray-600 mb-4">
                  You're on your way to becoming a group sponsor. Complete the requirements below to unlock group creation.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-blue-900 mb-3">What you need to create groups:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>{eligibility?.requirements.sevenDayActivity.met ? '✅' : '⏳'}</span>
                    <span className={eligibility?.requirements.sevenDayActivity.met ? 'text-green-700' : 'text-gray-700'}>
                      Stay active for 7 consecutive days
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{eligibility?.requirements.trainingCompletion.met ? '✅' : '⏳'}</span>
                    <span className={eligibility?.requirements.trainingCompletion.met ? 'text-green-700' : 'text-gray-700'}>
                      Complete all 8 wellness training modules
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>💡 <strong>Remember:</strong> You can still join groups with invite codes anytime!</p>
                <p>🎯 Keep tracking steps, logging food, and completing training to unlock group creation</p>
              </div>

              <button
                onClick={onClose}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
              >
                Continue Your Journey
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};