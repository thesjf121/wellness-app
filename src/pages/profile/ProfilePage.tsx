import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserProfile, ActivityLevel, WellnessGoal } from '../../types/user';
import { ROUTES } from '../../utils/constants';
import { TwoFactorAuth } from '../../components/security/TwoFactorAuth';
import { updateUserMetadata } from '../../utils/clerkHelpers';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { BottomNavigation } from '../../components/ui/BottomNavigation';

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  // TEMPORARY DEMO MODE - Remove after testing
  const isDemoMode = true;
  const demoUser = {
    id: 'demo_user_123',
    firstName: 'Demo',
    lastName: 'User',
    primaryEmailAddress: { emailAddress: 'demo@calerielife.com' }
  };
  
  const effectiveUser = user || (isDemoMode ? demoUser : null);
  const effectiveSignedIn = isSignedIn || isDemoMode;
  
  // DEBUG: Log the values
  console.log('ProfilePage DEBUG:', {
    user: !!user,
    isSignedIn,
    isDemoMode,
    effectiveUser: !!effectiveUser,
    effectiveSignedIn
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    phoneNumber: '',
    dateOfBirth: undefined,
    height: undefined,
    weight: undefined,
    activityLevel: 'moderate',
    wellnessGoals: [],
    medicalConditions: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    measurementSystem: 'imperial'
  });

  const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Light', description: '1-3 days/week' },
    { value: 'moderate', label: 'Moderate', description: '3-5 days/week' },
    { value: 'active', label: 'Active', description: '6-7 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Intense exercise daily' }
  ];

  const wellnessGoalOptions: { value: WellnessGoal; label: string }[] = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Improve Endurance' },
    { value: 'flexibility', label: 'Increase Flexibility' },
    { value: 'stress_reduction', label: 'Reduce Stress' },
    { value: 'better_sleep', label: 'Better Sleep' },
    { value: 'nutrition', label: 'Improve Nutrition' },
    { value: 'general_health', label: 'General Health' }
  ];

  useEffect(() => {
    if (effectiveUser) {
      loadProfile();
      loadProfilePicture();
    }
  }, [effectiveUser]);

  const loadProfile = () => {
    // Load from localStorage for now (would be from backend in production)
    const savedProfile = localStorage.getItem(`profile_${effectiveUser?.id}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (effectiveUser) {
      // Initialize with user data (real or demo)
      const clerkProfile = (user?.publicMetadata as any)?.profile || {};
      setProfile(prev => ({
        ...prev,
        firstName: effectiveUser.firstName || '',
        lastName: effectiveUser.lastName || '',
        email: effectiveUser.primaryEmailAddress?.emailAddress || '',
        displayName: `${effectiveUser.firstName} ${effectiveUser.lastName}`.trim(),
        ...clerkProfile
      }));
    }
  };

  const loadProfilePicture = () => {
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem(`profile_picture_${effectiveUser?.id}`);
    if (savedPicture) {
      setProfilePicture(savedPicture);
    // No default profile image for mock user
    }
  };

  const handleSave = async () => {
    if (!effectiveUser) return;
    
    setSaving(true);
    try {
      // Save to localStorage (in production, this would save to backend)
      localStorage.setItem(`profile_${effectiveUser.id}`, JSON.stringify(profile));
      
      // Update Clerk metadata (in production, this would be done via backend API)
      await updateUserMetadata(effectiveUser.id, {
        profile: {
          dailyStepGoal: profile.dailyStepGoal,
          dailyCalorieGoal: profile.dailyCalorieGoal,
          height: profile.height,
          weight: profile.weight,
          preferredUnits: profile.measurementSystem === 'metric' ? 'metric' : 'imperial'
        }
      });

      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setIsEditing(false);
  };

  const toggleWellnessGoal = (goal: WellnessGoal) => {
    setProfile(prev => ({
      ...prev,
      wellnessGoals: prev.wellnessGoals?.includes(goal)
        ? prev.wellnessGoals.filter(g => g !== goal)
        : [...(prev.wellnessGoals || []), goal]
    }));
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !effectiveUser) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      // Convert to base64 for localStorage (in production, would upload to cloud storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        localStorage.setItem(`profile_picture_${effectiveUser.id}`, base64String);
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    if (!effectiveUser) return;
    
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setProfilePicture('');
      localStorage.removeItem(`profile_picture_${effectiveUser.id}`);
      alert('Profile picture removed');
    }
  };

  const handleDeactivateAccount = async () => {
    if (!effectiveUser) return;
    
    if (window.confirm('Are you sure you want to deactivate your account? You can reactivate it by signing in again.')) {
      try {
        // In production, would call backend API to deactivate account
        // For now, just clear local data and sign out
        
        // Clear all local data
        localStorage.removeItem(`profile_${effectiveUser.id}`);
        localStorage.removeItem(`profile_picture_${effectiveUser.id}`);
        localStorage.removeItem('wellness-steps');
        localStorage.removeItem('step_entries');
        localStorage.removeItem('step_goal');
        localStorage.removeItem('notification_preferences');
        localStorage.removeItem('notification_history');
        
        alert('Account deactivated successfully. You will be signed out.');
        
        // Sign out user
        window.location.href = '/login';
      } catch (error) {
        console.error('Failed to deactivate account:', error);
        alert('Failed to deactivate account. Please try again.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!effectiveUser || deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.');
      return;
    }
    
    try {
      // In production, would call Clerk's user deletion API
      // For demo purposes, just clear all data and redirect
      
      // Clear all local data
      Object.keys(localStorage).forEach(key => {
        if (key.includes(effectiveUser.id) || key.startsWith('wellness_') || key.startsWith('step_') || key.startsWith('notification_')) {
          localStorage.removeItem(key);
        }
      });
      
      alert('Account deleted successfully. You will be redirected to the home page.');
      
      // In production: await user.delete();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  if (!effectiveSignedIn) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
          <WellnessCard>
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-gray-500">Please sign in to view your profile.</p>
            </CardContent>
          </WellnessCard>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
          </div>
          
          {!isEditing ? (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✏️ Edit Profile
            </motion.button>
          ) : (
            <div className="flex space-x-3">
              <motion.button
                onClick={handleCancel}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-all"
                whileHover={{ scale: saving ? 1 : 1.05 }}
                whileTap={{ scale: saving ? 1 : 0.95 }}
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">📸</span>
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {uploadingPicture && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 rounded-3xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <label className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          disabled={!isEditing || uploadingPicture}
                          className="sr-only"
                        />
                        <motion.span 
                          className={`inline-flex items-center px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all ${
                            isEditing && !uploadingPicture
                              ? 'border-purple-300 text-purple-700 hover:bg-purple-50 cursor-pointer bg-white'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                          }`}
                          whileHover={isEditing && !uploadingPicture ? { scale: 1.05 } : {}}
                          whileTap={isEditing && !uploadingPicture ? { scale: 0.95 } : {}}
                        >
                          {uploadingPicture ? '📤 Uploading...' : '📷 Change Photo'}
                        </motion.span>
                      </label>
                      
                      {profilePicture && isEditing && (
                        <motion.button
                          onClick={handleRemoveProfilePicture}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🗑️ Remove
                        </motion.button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF or WebP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">ℹ️</span>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName || ''}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName || ''}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName || ''}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.primaryEmailAddress?.emailAddress || ''}
                      disabled
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phoneNumber || ''}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profile.dateOfBirth instanceof Date ? profile.dateOfBirth.toISOString().split('T')[0] : ''}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value ? new Date(e.target.value) : undefined })}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-50 focus:border-purple-400 focus:ring-0 transition-colors"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Physical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">📏</span>
                  Physical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height ({profile.measurementSystem === 'imperial' ? 'inches' : 'cm'})
                </label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight ({profile.measurementSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement System
                </label>
                <select
                  value={profile.measurementSystem || 'imperial'}
                  onChange={(e) => setProfile({ ...profile, measurementSystem: e.target.value as 'imperial' | 'metric' })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                >
                  <option value="imperial">Imperial (ft/lbs)</option>
                  <option value="metric">Metric (cm/kg)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <div className="space-y-2">
                {activityLevels.map((level) => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="radio"
                      name="activityLevel"
                      value={level.value}
                      checked={profile.activityLevel === level.value}
                      onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">{level.label}</span>
                      <span className="text-sm text-gray-600 ml-2">({level.description})</span>
                    </div>
                  </label>
                ))}
                </div>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Wellness Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">🎯</span>
                  Wellness Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wellness Goals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {wellnessGoalOptions.map((goal) => (
                <label
                  key={goal.value}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    profile.wellnessGoals?.includes(goal.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  } ${!isEditing ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={profile.wellnessGoals?.includes(goal.value) || false}
                    onChange={() => toggleWellnessGoal(goal.value)}
                    disabled={!isEditing}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{goal.label}</span>
                </label>
              ))}
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">🚨</span>
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact?.name || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact!, name: e.target.value }
                  })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact?.relationship || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact!, relationship: e.target.value }
                  })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                  placeholder="e.g., Spouse, Parent, Friend"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.emergencyContact?.phoneNumber || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact!, phoneNumber: e.target.value }
                  })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Medical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">🏥</span>
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Conditions or Allergies
              </label>
              <textarea
                value={profile.medicalConditions?.join(', ') || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                disabled={!isEditing}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                placeholder="e.g., Diabetes, Peanut allergy, Asthma"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Security & Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">🔒</span>
                  Security & Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security & Sessions</h2>
            
            {/* Two-Factor Authentication */}
            <div className="mb-4">
              <TwoFactorAuth />
            </div>

            {/* Active Sessions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Active Sessions</h3>
                  <p className="text-sm text-gray-600">Manage your active sessions across all devices</p>
                </div>
                <button
                  onClick={() => navigate(`${ROUTES.PROFILE}/sessions`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Manage Sessions
                </button>
              </div>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>

          {/* Account Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <WellnessCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3">⚙️</span>
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h2>
            
            {/* Deactivate Account */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">Deactivate Account</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Temporarily disable your account. You can reactivate it anytime by signing in.
                  </p>
                  <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                    <li>• Your profile will be hidden from other users</li>
                    <li>• Your data will be preserved</li>
                    <li>• You can reactivate by signing in again</li>
                  </ul>
                </div>
                <button
                  onClick={handleDeactivateAccount}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Deactivate
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="font-medium text-red-800">Delete Account Permanently</h3>
                <p className="text-sm text-red-700 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <ul className="text-xs text-red-600 mt-2 space-y-1">
                  <li>• All your data will be permanently deleted</li>
                  <li>• Your profile and activity history will be removed</li>
                  <li>• You will be removed from all groups</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-red-800 mb-1">
                      Type "DELETE" to confirm permanent account deletion:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Type DELETE to confirm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
                )}
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>
        </div>
      </div>
      
      <BottomNavigation />
    </>
  );
};

export default ProfilePage;