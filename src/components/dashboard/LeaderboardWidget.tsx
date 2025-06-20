import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../../context/MockAuthContext';
import { ROUTES } from '../../utils/constants';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number; // Position change from last period
  badge?: string;
  isCurrentUser?: boolean;
  groupName?: string;
  streak: number;
  achievements: number;
}

interface LeaderboardCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  metric: string;
}

interface LeaderboardWidgetProps {
  compact?: boolean;
  showGlobal?: boolean;
  maxEntries?: number;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ 
  compact = false, 
  showGlobal = false,
  maxEntries = 10 
}) => {
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const categories: LeaderboardCategory[] = [
    {
      id: 'overall',
      name: 'Overall Score',
      icon: '🏆',
      description: 'Combined wellness score',
      metric: 'points'
    },
    {
      id: 'steps',
      name: 'Step Count',
      icon: '👟',
      description: 'Total steps taken',
      metric: 'steps'
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: '🥗',
      description: 'Healthy eating score',
      metric: 'nutrition points'
    },
    {
      id: 'training',
      name: 'Learning',
      icon: '🎓',
      description: 'Training modules completed',
      metric: 'modules'
    },
    {
      id: 'streaks',
      name: 'Consistency',
      icon: '🔥',
      description: 'Longest wellness streak',
      metric: 'days'
    },
    {
      id: 'social',
      name: 'Team Spirit',
      icon: '👥',
      description: 'Group participation score',
      metric: 'activity points'
    }
  ];

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedCategory, selectedPeriod]);

  const loadLeaderboardData = () => {
    setLoading(true);
    
    // Generate mock leaderboard data
    const mockEntries: LeaderboardEntry[] = [];
    const names = [
      'Sarah Johnson', 'Alex Chen', 'Mike Rodriguez', 'Emily Davis', 
      'Jordan Kim', 'Taylor Brown', 'Casey Wilson', 'Morgan Lee',
      'Riley Parker', 'Quinn Taylor', 'Avery Jones', 'Cameron Smith',
      'Drew Anderson', 'Sage Martinez', 'Phoenix Wright', 'River Stone'
    ];

    // Add current user to the mix
    if (user) {
      names.push(`${user.firstName} ${user.lastName || ''}`);
    }

    for (let i = 0; i < Math.min(names.length, 20); i++) {
      const isCurrentUser = user && names[i].includes(user.firstName);
      const baseScore = generateScoreForCategory(selectedCategory);
      const variance = Math.random() * 0.3 - 0.15; // ±15% variance
      const score = Math.floor(baseScore * (1 + variance));
      
      mockEntries.push({
        id: `user_${i}`,
        name: names[i],
        score: score,
        rank: i + 1,
        change: Math.floor(Math.random() * 6) - 3, // -3 to +3 position change
        badge: getBadgeForRank(i + 1),
        isCurrentUser: isCurrentUser,
        groupName: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Solo'][Math.floor(Math.random() * 4)],
        streak: Math.floor(Math.random() * 30) + 1,
        achievements: Math.floor(Math.random() * 15) + 3
      });
    }

    // Sort by score
    mockEntries.sort((a, b) => b.score - a.score);
    
    // Update ranks
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(mockEntries);
    
    // Find current user's position
    const currentUserEntry = mockEntries.find(entry => entry.isCurrentUser);
    if (currentUserEntry) {
      setUserRank(currentUserEntry);
    } else if (user) {
      // If user not in top entries, create a mock entry
      setUserRank({
        id: 'current_user',
        name: `${user.firstName} ${user.lastName || ''}`,
        score: generateScoreForCategory(selectedCategory),
        rank: Math.floor(Math.random() * 50) + 21, // Rank 21-70
        change: Math.floor(Math.random() * 6) - 3,
        isCurrentUser: true,
        groupName: 'Your Team',
        streak: Math.floor(Math.random() * 15) + 1,
        achievements: Math.floor(Math.random() * 10) + 2
      });
    }
    
    setLoading(false);
  };

  const generateScoreForCategory = (category: string) => {
    switch (category) {
      case 'steps':
        return Math.floor(Math.random() * 50000) + 30000; // 30k-80k steps
      case 'nutrition':
        return Math.floor(Math.random() * 500) + 200; // 200-700 nutrition points
      case 'training':
        return Math.floor(Math.random() * 8) + 1; // 1-8 modules
      case 'streaks':
        return Math.floor(Math.random() * 60) + 1; // 1-60 days
      case 'social':
        return Math.floor(Math.random() * 300) + 100; // 100-400 activity points
      default: // overall
        return Math.floor(Math.random() * 2000) + 500; // 500-2500 overall points
    }
  };

  const getBadgeForRank = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏅';
    return '';
  };

  const getRankChangeDisplay = (change: number) => {
    if (change > 0) {
      return <span className="text-green-600 text-xs">▲{change}</span>;
    } else if (change < 0) {
      return <span className="text-red-600 text-xs">▼{Math.abs(change)}</span>;
    } else {
      return <span className="text-gray-400 text-xs">-</span>;
    }
  };

  const formatScore = (score: number, category: string) => {
    switch (category) {
      case 'steps':
        return score.toLocaleString();
      case 'training':
        return score.toString();
      case 'streaks':
        return `${score} day${score > 1 ? 's' : ''}`;
      default:
        return score.toLocaleString();
    }
  };

  const getScoreLabel = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.metric : 'points';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Leaderboard</h3>
          <span className="text-xl">🏆</span>
        </div>

        <div className="space-y-2">
          {leaderboard.slice(0, 5).map(entry => (
            <div key={entry.id} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-600 w-4">#{entry.rank}</span>
                {entry.badge && <span className="text-sm">{entry.badge}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${entry.isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatScore(entry.score, selectedCategory)} {getScoreLabel(selectedCategory)}
                </p>
              </div>
              {getRankChangeDisplay(entry.change)}
            </div>
          ))}
        </div>

        {userRank && userRank.rank > 5 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3 bg-blue-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-blue-600">#{userRank.rank}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-600">You</p>
                <p className="text-xs text-blue-500">
                  {formatScore(userRank.score, selectedCategory)} {getScoreLabel(selectedCategory)}
                </p>
              </div>
              {getRankChangeDisplay(userRank.change)}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full mt-3 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100"
        >
          View Full Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Leaderboard</h3>
        <span className="text-2xl">🏆</span>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={category.description}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <div className="flex space-x-2">
            {[
              { id: 'weekly', label: 'This Week' },
              { id: 'monthly', label: 'This Month' },
              { id: 'alltime', label: 'All Time' }
            ].map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current User Rank (if not in top list) */}
      {userRank && userRank.rank > maxEntries && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Your Ranking</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-blue-600">#{userRank.rank}</span>
                {userRank.badge && <span className="text-lg">{userRank.badge}</span>}
              </div>
              <div>
                <p className="font-medium text-blue-900">{userRank.name}</p>
                <p className="text-sm text-blue-700">
                  {formatScore(userRank.score, selectedCategory)} {getScoreLabel(selectedCategory)}
                </p>
              </div>
            </div>
            <div className="text-right">
              {getRankChangeDisplay(userRank.change)}
              <p className="text-xs text-blue-600 mt-1">{userRank.groupName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.slice(0, maxEntries).map(entry => (
          <div 
            key={entry.id} 
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              entry.isCurrentUser 
                ? 'bg-blue-50 border-2 border-blue-200' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${
                  entry.rank <= 3 ? 'text-yellow-600' : 
                  entry.rank <= 10 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  #{entry.rank}
                </span>
                {entry.badge && <span className="text-xl">{entry.badge}</span>}
              </div>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                entry.isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {entry.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>

              <div>
                <h4 className={`font-semibold ${entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                  {entry.name}
                  {entry.isCurrentUser && <span className="ml-2 text-blue-600 text-sm">(You)</span>}
                </h4>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{entry.groupName}</span>
                  <span>•</span>
                  <span>🔥 {entry.streak}d streak</span>
                  <span>•</span>
                  <span>🏆 {entry.achievements} badges</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-lg font-bold ${entry.isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                {formatScore(entry.score, selectedCategory)}
              </p>
              <p className="text-sm text-gray-500">{getScoreLabel(selectedCategory)}</p>
              <div className="mt-1">
                {getRankChangeDisplay(entry.change)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      {leaderboard.length > maxEntries && (
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/leaderboard')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Full Leaderboard ({leaderboard.length} total entries)
          </button>
        </div>
      )}

      {/* Join Competition CTA */}
      {!showGlobal && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🌟 Join Global Competition</h4>
          <p className="text-sm text-gray-600 mb-3">
            Compete with wellness enthusiasts worldwide and climb the global rankings!
          </p>
          <button 
            onClick={() => navigate('/leaderboard/global')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Join Global Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget;