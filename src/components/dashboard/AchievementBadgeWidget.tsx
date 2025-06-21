import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/constants';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'steps' | 'nutrition' | 'training' | 'streak' | 'social' | 'special';
  requirement: string;
  earned: boolean;
  earnedDate?: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  progressMax?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
  badge?: Badge;
  value?: number;
  unit?: string;
}

interface AchievementBadgeWidgetProps {
  compact?: boolean;
  showOnlyRecent?: boolean;
  maxBadges?: number;
}

const AchievementBadgeWidget: React.FC<AchievementBadgeWidgetProps> = ({ 
  compact = false, 
  showOnlyRecent = false,
  maxBadges = 12
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievementData();
  }, []);

  const loadAchievementData = () => {
    setLoading(true);
    
    // Generate comprehensive badge system
    const allBadges: Badge[] = [
      // Step Badges
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first day of step tracking',
        icon: '👟',
        color: 'blue',
        category: 'steps',
        requirement: '1 day tracked',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        rarity: 'common'
      },
      {
        id: 'step_warrior',
        name: 'Step Warrior',
        description: 'Reach 10,000 steps in a single day',
        icon: '🏃‍♂️',
        color: 'green',
        category: 'steps',
        requirement: '10,000 steps/day',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
        rarity: 'uncommon'
      },
      {
        id: 'marathon_walker',
        name: 'Marathon Walker',
        description: 'Walk 26.2 miles (42,000 steps) in one day',
        icon: '🏆',
        color: 'gold',
        category: 'steps',
        requirement: '42,000 steps/day',
        earned: false,
        rarity: 'epic',
        progress: 28500,
        progressMax: 42000
      },
      {
        id: 'consistent_stepper',
        name: 'Consistent Stepper',
        description: 'Reach daily step goal for 7 consecutive days',
        icon: '📅',
        color: 'purple',
        category: 'steps',
        requirement: '7-day streak',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        rarity: 'rare'
      },

      // Nutrition Badges
      {
        id: 'food_logger',
        name: 'Food Logger',
        description: 'Log your first meal with AI analysis',
        icon: '🥗',
        color: 'green',
        category: 'nutrition',
        requirement: '1 meal logged',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        rarity: 'common'
      },
      {
        id: 'balanced_eater',
        name: 'Balanced Eater',
        description: 'Meet all macro targets for 3 consecutive days',
        icon: '⚖️',
        color: 'orange',
        category: 'nutrition',
        requirement: '3-day macro balance',
        earned: false,
        rarity: 'uncommon',
        progress: 1,
        progressMax: 3
      },
      {
        id: 'hydration_hero',
        name: 'Hydration Hero',
        description: 'Drink 8 glasses of water in one day',
        icon: '💧',
        color: 'blue',
        category: 'nutrition',
        requirement: '8 glasses/day',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
        rarity: 'common'
      },

      // Training Badges
      {
        id: 'wellness_student',
        name: 'Wellness Student',
        description: 'Complete your first training module',
        icon: '🎓',
        color: 'purple',
        category: 'training',
        requirement: '1 module completed',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        rarity: 'common'
      },
      {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 5 training modules',
        icon: '📚',
        color: 'indigo',
        category: 'training',
        requirement: '5 modules completed',
        earned: false,
        rarity: 'uncommon',
        progress: 2,
        progressMax: 5
      },
      {
        id: 'wellness_expert',
        name: 'Wellness Expert',
        description: 'Complete all 8 training modules',
        icon: '🏅',
        color: 'gold',
        category: 'training',
        requirement: 'All 8 modules',
        earned: false,
        rarity: 'epic',
        progress: 2,
        progressMax: 8
      },

      // Streak Badges
      {
        id: 'streak_starter',
        name: 'Streak Starter',
        description: 'Maintain a 3-day wellness streak',
        icon: '🔥',
        color: 'orange',
        category: 'streak',
        requirement: '3-day streak',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        rarity: 'common'
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day wellness streak',
        icon: '⚡',
        color: 'yellow',
        category: 'streak',
        requirement: '7-day streak',
        earned: false,
        rarity: 'uncommon',
        progress: 5,
        progressMax: 7
      },
      {
        id: 'month_master',
        name: 'Month Master',
        description: 'Maintain a 30-day wellness streak',
        icon: '💫',
        color: 'purple',
        category: 'streak',
        requirement: '30-day streak',
        earned: false,
        rarity: 'legendary',
        progress: 5,
        progressMax: 30
      },

      // Social Badges
      {
        id: 'team_player',
        name: 'Team Player',
        description: 'Join your first wellness group',
        icon: '👥',
        color: 'blue',
        category: 'social',
        requirement: 'Join a group',
        earned: false,
        rarity: 'common'
      },
      {
        id: 'motivator',
        name: 'Motivator',
        description: 'Help 5 team members reach their goals',
        icon: '🙌',
        color: 'green',
        category: 'social',
        requirement: 'Help 5 members',
        earned: false,
        rarity: 'rare',
        progress: 1,
        progressMax: 5
      },

      // Special Badges
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'One of the first 100 users to join',
        icon: '🌟',
        color: 'gold',
        category: 'special',
        requirement: 'First 100 users',
        earned: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        rarity: 'rare'
      },
      {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Meet all daily goals for 7 consecutive days',
        icon: '✨',
        color: 'rainbow',
        category: 'special',
        requirement: '7 perfect days',
        earned: false,
        rarity: 'legendary',
        progress: 3,
        progressMax: 7
      }
    ];

    setBadges(allBadges);

    // Generate recent achievements
    const earnedBadges = allBadges.filter(badge => badge.earned);
    const achievements: Achievement[] = earnedBadges
      .sort((a, b) => (b.earnedDate?.getTime() || 0) - (a.earnedDate?.getTime() || 0))
      .slice(0, 5)
      .map(badge => ({
        id: `achievement_${badge.id}`,
        title: `Earned: ${badge.name}`,
        description: badge.description,
        icon: badge.icon,
        timestamp: badge.earnedDate!,
        badge
      }));

    // Add some general achievements
    achievements.push({
      id: 'profile_complete',
      title: 'Profile Completed',
      description: 'Set up your wellness profile and preferences',
      icon: '✅',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18)
    });

    setRecentAchievements(achievements.slice(0, 6));
    setLoading(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'uncommon': return 'bg-green-100 border-green-300 text-green-700';
      case 'rare': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'epic': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 text-orange-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getBadgeColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'yellow': return 'bg-yellow-500 text-white';
      case 'indigo': return 'bg-indigo-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'rainbow': return 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'steps', name: 'Steps', icon: '👟' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'training', name: 'Training', icon: '🎓' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'special', name: 'Special', icon: '⭐' }
  ];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact || showOnlyRecent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">
            {showOnlyRecent ? 'Recent Achievements' : 'Badges'}
          </h3>
          <span className="text-xl">🏆</span>
        </div>

        {showOnlyRecent ? (
          <div className="space-y-3">
            {recentAchievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{achievement.title}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(achievement.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {badges.filter(b => b.earned).slice(0, 8).map(badge => (
              <div 
                key={badge.id} 
                className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-lg ${getBadgeColorClasses(badge.color)}`}
                title={badge.name}
              >
                {badge.icon}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  badge.rarity === 'legendary' ? 'bg-yellow-400' :
                  badge.rarity === 'epic' ? 'bg-purple-400' :
                  badge.rarity === 'rare' ? 'bg-blue-400' : 'bg-green-400'
                }`}></div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/achievements')}
          className="w-full mt-3 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100"
        >
          View All {showOnlyRecent ? 'Achievements' : 'Badges'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Achievements & Badges</h3>
        <span className="text-2xl">🏆</span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {badges.filter(b => b.earned).length}
          </div>
          <div className="text-xs text-gray-500">Badges Earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((badges.filter(b => b.earned).length / badges.length) * 100)}%
          </div>
          <div className="text-xs text-gray-500">Collection Complete</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {badges.filter(b => b.earned && b.rarity === 'rare').length + 
             badges.filter(b => b.earned && b.rarity === 'epic').length + 
             badges.filter(b => b.earned && b.rarity === 'legendary').length}
          </div>
          <div className="text-xs text-gray-500">Rare Badges</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.slice(0, maxBadges).map(badge => (
          <div 
            key={badge.id} 
            className={`relative border-2 rounded-lg p-4 transition-all hover:scale-105 ${
              badge.earned 
                ? `${getRarityColor(badge.rarity)} shadow-md` 
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${
                badge.earned 
                  ? getBadgeColorClasses(badge.color)
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {badge.icon}
              </div>
              
              <h4 className={`font-semibold text-sm mb-1 ${badge.earned ? '' : 'text-gray-400'}`}>
                {badge.name}
              </h4>
              
              <p className={`text-xs mb-2 ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                {badge.description}
              </p>
              
              <div className={`text-xs ${badge.earned ? 'text-gray-500' : 'text-gray-400'}`}>
                {badge.requirement}
              </div>

              {/* Progress Bar for unearned badges */}
              {!badge.earned && badge.progress !== undefined && badge.progressMax && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(badge.progress / badge.progressMax) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {badge.progress}/{badge.progressMax}
                  </div>
                </div>
              )}

              {/* Earned Date */}
              {badge.earned && badge.earnedDate && (
                <div className="text-xs text-gray-500 mt-1">
                  Earned {getTimeAgo(badge.earnedDate)}
                </div>
              )}
            </div>

            {/* Rarity Indicator */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
              badge.rarity === 'legendary' ? 'bg-yellow-400' :
              badge.rarity === 'epic' ? 'bg-purple-400' :
              badge.rarity === 'rare' ? 'bg-blue-400' :
              badge.rarity === 'uncommon' ? 'bg-green-400' : 'bg-gray-300'
            }`} title={badge.rarity}></div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      {filteredBadges.length > maxBadges && (
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/achievements')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All {filteredBadges.length} Badges
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementBadgeWidget;