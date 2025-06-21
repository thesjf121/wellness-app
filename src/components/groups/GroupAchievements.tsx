import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { groupAchievementService } from '../../services/groupAchievementService';
import { MemberAchievement } from '../../types/groups';

interface GroupAchievementsProps {
  groupId: string;
  showUserView?: boolean; // Show user's personal achievements vs group leaderboard
}

interface LeaderboardEntry {
  userId: string;
  achievementCount: number;
  achievements: MemberAchievement[];
  categories: Record<string, number>;
}

export const GroupAchievements: React.FC<GroupAchievementsProps> = ({ 
  groupId, 
  showUserView = false 
}) => {
  const { user } = useUser();
  const [userAchievements, setUserAchievements] = useState<MemberAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earned' | 'available' | 'leaderboard'>('earned');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAchievementData();
  }, [groupId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAchievementData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user's achievements
      const achievements = await groupAchievementService.getUserAchievements(user.id, groupId);
      setUserAchievements(achievements);

      // Load achievement progress
      const progress = await groupAchievementService.getUserAchievementProgress(user.id, groupId);
      setAchievementProgress(progress);

      // Load group leaderboard
      const leaderboardData = await groupAchievementService.getGroupLeaderboard(groupId);
      setLeaderboard(leaderboardData);

      setError(null);
    } catch (error) {
      console.error('Failed to load achievement data:', error);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAchievements = async () => {
    if (!user) return;

    try {
      const newAchievements = await groupAchievementService.checkUserAchievements(user.id, groupId);
      if (newAchievements.length > 0) {
        await loadAchievementData(); // Refresh data
        // Show notification for new achievements
        alert(`🎉 You earned ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`);
      } else {
        alert('No new achievements earned. Keep up the great work!');
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
      setError('Failed to check for new achievements');
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'activity': return '⚡';
      case 'consistency': return '📅';
      case 'social': return '👥';
      case 'milestone': return '🎯';
      default: return '⭐';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={loadAchievementData}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Group Achievements</h2>
            <p className="text-gray-600 text-sm mt-1">
              {userAchievements.length} earned • {achievementProgress.filter(a => !a.isEarned).length} available
            </p>
          </div>
          <button
            onClick={handleCheckAchievements}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Check New Achievements
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'earned', label: 'Earned', count: userAchievements.length },
            { id: 'available', label: 'Available', count: achievementProgress.filter(a => !a.isEarned).length },
            { id: 'leaderboard', label: 'Leaderboard' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'earned' && (
          <div className="space-y-4">
            {userAchievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🏆</div>
                <p className="text-gray-500">No achievements earned yet</p>
                <p className="text-gray-400 text-sm mt-1">Complete activities to start earning achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAchievements.map((achievement) => {
                  const progress = achievementProgress.find(p => p.type === achievement.achievementType);
                  return (
                    <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{achievement.iconEmoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            {progress && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(progress.difficulty)}`}>
                                {progress.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Earned {formatDate(achievement.earnedAt)}
                            </span>
                            {progress && (
                              <span className="text-xs text-gray-500">
                                {getCategoryIcon(progress.category)} {progress.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementProgress.filter(achievement => !achievement.isEarned).map((achievement) => (
                <div key={achievement.type} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl grayscale">{achievement.iconEmoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(achievement.difficulty)}`}>
                          {achievement.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getCategoryIcon(achievement.category)} {achievement.category}
                        </span>
                        {achievement.progress && (
                          <span className="text-xs text-blue-600 font-medium">
                            {achievement.progress.current}/{achievement.progress.target}
                          </span>
                        )}
                      </div>
                      {achievement.progress && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(achievement.progress.percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🏅</div>
                <p className="text-gray-500">No achievements earned in the group yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to earn an achievement!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className={`flex items-center justify-between p-4 rounded-lg border ${ 
                    entry.userId === user?.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          User {entry.userId.slice(-8)}
                          {entry.userId === user?.id && (
                            <span className="ml-2 text-blue-600 text-sm">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.achievementCount} achievement{entry.achievementCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Category breakdown */}
                      <div className="flex space-x-2">
                        {Object.entries(entry.categories).map(([category, count]) => (
                          <div key={category} className="text-center">
                            <div className="text-lg">{getCategoryIcon(category)}</div>
                            <div className="text-xs text-gray-600">{count}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent achievements */}
                      <div className="flex space-x-1">
                        {entry.achievements.slice(0, 3).map((achievement) => (
                          <div 
                            key={achievement.id}
                            className="text-lg"
                            title={`${achievement.title} - ${achievement.description}`}
                          >
                            {achievement.iconEmoji}
                          </div>
                        ))}
                        {entry.achievements.length > 3 && (
                          <div className="text-sm text-gray-500 self-center">
                            +{entry.achievements.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupAchievements;