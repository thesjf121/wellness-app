import React, { useState, useEffect } from 'react';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'module' | 'exercise' | 'streak' | 'score' | 'special';
  requirement: any;
  earned: boolean;
  earnedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgesProps {
  userId: string;
  compact?: boolean;
  showOnlyEarned?: boolean;
  onClose?: () => void;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  userId,
  compact = false,
  showOnlyEarned = false,
  onClose
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      // Get user progress data
      const userProgress = wellnessTrainingService.getUserProgress(userId);
      const submissions = wellnessTrainingService.getExerciseSubmissions(userId);
      const completedModules = userProgress.filter(p => p.status === 'completed');

      // Define all possible achievements
      const allAchievements: Achievement[] = [
        // Module completion achievements
        {
          id: 'first_module',
          title: 'First Steps',
          description: 'Complete your first wellness module',
          icon: '🌱',
          category: 'module',
          requirement: { modulesCompleted: 1 },
          earned: completedModules.length >= 1,
          earnedAt: completedModules[0]?.completedAt,
          rarity: 'common'
        },
        {
          id: 'half_way',
          title: 'Halfway Hero',
          description: 'Complete 4 wellness modules',
          icon: '🏃‍♀️',
          category: 'module',
          requirement: { modulesCompleted: 4 },
          earned: completedModules.length >= 4,
          earnedAt: completedModules[3]?.completedAt,
          rarity: 'rare'
        },
        {
          id: 'wellness_master',
          title: 'Wellness Master',
          description: 'Complete all 8 wellness modules',
          icon: '🏆',
          category: 'module',
          requirement: { modulesCompleted: 8 },
          earned: completedModules.length >= 8,
          earnedAt: completedModules[7]?.completedAt,
          rarity: 'legendary'
        },

        // Exercise achievements
        {
          id: 'exercise_enthusiast',
          title: 'Exercise Enthusiast',
          description: 'Complete 10 interactive exercises',
          icon: '💪',
          category: 'exercise',
          requirement: { exercisesCompleted: 10 },
          earned: submissions.length >= 10,
          earnedAt: submissions[9]?.submittedAt,
          rarity: 'common'
        },
        {
          id: 'practice_perfecter',
          title: 'Practice Perfecter',
          description: 'Complete 25 interactive exercises',
          icon: '🎯',
          category: 'exercise',
          requirement: { exercisesCompleted: 25 },
          earned: submissions.length >= 25,
          earnedAt: submissions[24]?.submittedAt,
          rarity: 'rare'
        },

        // Score achievements
        {
          id: 'high_scorer',
          title: 'High Scorer',
          description: 'Achieve 90+ score on 5 exercises',
          icon: '⭐',
          category: 'score',
          requirement: { highScores: 5 },
          earned: submissions.filter(s => (s.score || 0) >= 90).length >= 5,
          earnedAt: submissions.filter(s => (s.score || 0) >= 90)[4]?.submittedAt,
          rarity: 'rare'
        },
        {
          id: 'perfectionist',
          title: 'Perfectionist',
          description: 'Achieve perfect 100 score on an exercise',
          icon: '💯',
          category: 'score',
          requirement: { perfectScore: 1 },
          earned: submissions.some(s => (s.score || 0) === 100),
          earnedAt: submissions.find(s => (s.score || 0) === 100)?.submittedAt,
          rarity: 'epic'
        },

        // Special achievements
        {
          id: 'early_bird',
          title: 'Early Bird',
          description: 'Complete an exercise before 8 AM',
          icon: '🌅',
          category: 'special',
          requirement: { earlyCompletion: true },
          earned: submissions.some(s => new Date(s.submittedAt).getHours() < 8),
          earnedAt: submissions.find(s => new Date(s.submittedAt).getHours() < 8)?.submittedAt,
          rarity: 'epic'
        },
        {
          id: 'night_owl',
          title: 'Night Owl',
          description: 'Complete an exercise after 10 PM',
          icon: '🦉',
          category: 'special',
          requirement: { lateCompletion: true },
          earned: submissions.some(s => new Date(s.submittedAt).getHours() >= 22),
          earnedAt: submissions.find(s => new Date(s.submittedAt).getHours() >= 22)?.submittedAt,
          rarity: 'epic'
        },
        {
          id: 'weekend_warrior',
          title: 'Weekend Warrior',
          description: 'Complete exercises on both Saturday and Sunday',
          icon: '🗓️',
          category: 'special',
          requirement: { weekendCompletion: true },
          earned: checkWeekendWarrior(submissions),
          earnedAt: getWeekendWarriorDate(submissions),
          rarity: 'rare'
        },
        {
          id: 'consistency_champion',
          title: 'Consistency Champion',
          description: 'Complete exercises on 7 consecutive days',
          icon: '🔥',
          category: 'streak',
          requirement: { consecutiveDays: 7 },
          earned: checkConsecutiveDays(submissions, 7),
          earnedAt: getConsecutiveDaysDate(submissions, 7),
          rarity: 'epic'
        }
      ];

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWeekendWarrior = (submissions: any[]): boolean => {
    const weekends = new Set();
    submissions.forEach(s => {
      const date = new Date(s.submittedAt);
      const day = date.getDay();
      if (day === 0 || day === 6) { // Sunday or Saturday
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - day);
        weekends.add(weekStart.toDateString());
      }
    });
    
    // Check if any weekend has both Saturday and Sunday
    for (const weekend of weekends) {
      const weekStart = new Date(weekend as string);
      const saturday = new Date(weekStart);
      saturday.setDate(weekStart.getDate() + 6);
      const sunday = new Date(weekStart);
      sunday.setDate(weekStart.getDate() + 7);
      
      const hasSaturday = submissions.some(s => {
        const date = new Date(s.submittedAt);
        return date.toDateString() === saturday.toDateString();
      });
      
      const hasSunday = submissions.some(s => {
        const date = new Date(s.submittedAt);
        return date.toDateString() === sunday.toDateString();
      });
      
      if (hasSaturday && hasSunday) return true;
    }
    return false;
  };

  const getWeekendWarriorDate = (submissions: any[]): Date | undefined => {
    if (!checkWeekendWarrior(submissions)) return undefined;
    
    const weekendSubmissions = submissions.filter(s => {
      const day = new Date(s.submittedAt).getDay();
      return day === 0 || day === 6;
    });
    
    return weekendSubmissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0]?.submittedAt;
  };

  const checkConsecutiveDays = (submissions: any[], requiredDays: number): boolean => {
    if (submissions.length < requiredDays) return false;
    
    const dates = [...new Set(submissions.map(s => 
      new Date(s.submittedAt).toDateString()
    ))].sort();
    
    let consecutiveCount = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        consecutiveCount++;
        if (consecutiveCount >= requiredDays) return true;
      } else {
        consecutiveCount = 1;
      }
    }
    
    return false;
  };

  const getConsecutiveDaysDate = (submissions: any[], requiredDays: number): Date | undefined => {
    if (!checkConsecutiveDays(submissions, requiredDays)) return undefined;
    
    const dates = [...new Set(submissions.map(s => 
      new Date(s.submittedAt).toDateString()
    ))].sort();
    
    let consecutiveCount = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        consecutiveCount++;
        if (consecutiveCount >= requiredDays) {
          return new Date(dates[i]);
        }
      } else {
        consecutiveCount = 1;
      }
    }
    
    return undefined;
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'rare': return 'text-blue-700';
      case 'epic': return 'text-purple-700';
      case 'legendary': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  const filteredAchievements = () => {
    let filtered = achievements;
    
    if (showOnlyEarned) {
      filtered = filtered.filter(a => a.earned);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      // Earned achievements first
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      
      // Then by rarity
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
             (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
    });
  };

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const content = (
    <>
      {/* Stats */}
      <div className="mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {earnedCount}/{totalCount}
          </div>
          <p className="text-gray-600">Achievements Earned</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      {!compact && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({achievements.length})
          </button>
          {['module', 'exercise', 'score', 'streak', 'special'].map(category => {
            const count = achievements.filter(a => a.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Achievement Grid */}
      <div className={`grid gap-4 ${
        compact 
          ? 'grid-cols-2 md:grid-cols-4' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredAchievements().map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.earned 
                ? getRarityColor(achievement.rarity)
                : 'border-gray-200 bg-gray-100 opacity-60'
            } ${compact ? 'text-center' : ''}`}
          >
            <div className={`text-3xl mb-2 ${compact ? 'text-center' : ''}`}>
              {achievement.earned ? achievement.icon : '🔒'}
            </div>
            
            <h3 className={`font-semibold mb-1 ${
              achievement.earned 
                ? getRarityTextColor(achievement.rarity)
                : 'text-gray-500'
            }`}>
              {achievement.title}
            </h3>
            
            {!compact && (
              <p className={`text-sm mb-2 ${
                achievement.earned ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${
                achievement.earned 
                  ? getRarityColor(achievement.rarity)
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {achievement.rarity}
              </span>
              
              {achievement.earned && achievement.earnedAt && (
                <span className="text-gray-500">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements().length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🏆</div>
          <p className="text-gray-600">No achievements in this category yet</p>
        </div>
      )}
    </>
  );

  // Modal view
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              🏆 Achievement Badges
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Inline view
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🏆 Your Achievements
      </h3>
      {content}
    </div>
  );
};

export default AchievementBadges;