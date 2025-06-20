import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { memberActivityService } from '../../services/memberActivityService';
import { groupService } from '../../services/groupService';
import { groupActivityFeedService } from '../../services/groupActivityFeedService';

interface GroupActivityFeedProps {
  groupId: string;
  maxItems?: number;
}

interface FeedItem {
  id: string;
  type: 'activity' | 'milestone' | 'member_joined';
  userId: string;
  userName: string;
  content: string;
  icon: string;
  iconColor: string;
  timestamp: Date;
  metadata?: any;
}

export const GroupActivityFeed: React.FC<GroupActivityFeedProps> = ({ 
  groupId, 
  maxItems = 20 
}) => {
  const { user } = useUser();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivityFeed();
  }, [groupId]);

  const loadActivityFeed = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get special feed activities (milestones, achievements, etc.)
      const specialActivities = await groupActivityFeedService.getGroupFeedActivities(groupId, maxItems);
      
      // Get recent member activities for regular activity
      const memberActivities = await memberActivityService.getGroupMemberActivities(groupId, 3);
      
      // Get group members for name mapping
      const members = await groupService.getGroupMembers(groupId);
      const memberMap = new Map(members.map(m => [m.userId, `User ${m.userId.slice(-8)}`]));

      // Convert special activities to feed items
      const specialFeedItems: FeedItem[] = specialActivities.map(activity => {
        const userName = memberMap.get(activity.userId) || 'Unknown User';
        
        return {
          id: activity.id,
          type: 'milestone' as const,
          userId: activity.userId,
          userName,
          content: `${userName} ${activity.description}`,
          icon: activity.icon,
          iconColor: activity.iconColor,
          timestamp: activity.createdAt,
          metadata: {
            title: activity.title,
            isHighlight: activity.isHighlight,
            ...activity.metadata
          }
        };
      });

      // Convert regular activities to feed items (fewer of these)
      const regularFeedItems: FeedItem[] = memberActivities.slice(0, Math.max(3, maxItems - specialFeedItems.length)).map(activity => {
        const userName = memberMap.get(activity.userId) || 'Unknown User';
        
        return {
          id: activity.id,
          type: 'activity' as const,
          userId: activity.userId,
          userName,
          content: generateActivityContent(activity, userName),
          icon: getActivityIcon(activity.activityType),
          iconColor: getActivityIconColor(activity.activityType),
          timestamp: activity.createdAt,
          metadata: activity.metadata
        };
      });

      // Combine and sort all activities
      const allItems = [...specialFeedItems, ...regularFeedItems]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxItems);

      setFeedItems(allItems);
      setError(null);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const generateActivityContent = (activity: any, userName: string): string => {
    switch (activity.activityType) {
      case 'steps':
        const steps = activity.value.toLocaleString();
        return `${userName} logged ${steps} steps`;
      case 'food_entry':
        const entries = activity.value;
        return `${userName} added ${entries} food ${entries === 1 ? 'entry' : 'entries'}`;
      case 'training_completion':
        return `${userName} completed a training module`;
      case 'group_interaction':
        return `${userName} interacted with the group`;
      default:
        return `${userName} was active`;
    }
  };

  const getActivityIcon = (activityType: string): string => {
    switch (activityType) {
      case 'steps':
        return '👟';
      case 'food_entry':
        return '🍎';
      case 'training_completion':
        return '🎓';
      case 'group_interaction':
        return '💬';
      default:
        return '⭐';
    }
  };

  const getActivityIconColor = (activityType: string): string => {
    switch (activityType) {
      case 'steps':
        return 'bg-blue-100 text-blue-600';
      case 'food_entry':
        return 'bg-green-100 text-green-600';
      case 'training_completion':
        return 'bg-purple-100 text-purple-600';
      case 'group_interaction':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReaction = async (feedItemId: string, emoji: string) => {
    // This would implement reactions to feed items
    // For now, we'll just show a simple interaction
    console.log(`Reacting to ${feedItemId} with ${emoji}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Group Activity</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-3 p-3">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Group Activity</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={loadActivityFeed}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Group Activity</h3>
        <button
          onClick={loadActivityFeed}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {feedItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No recent activity to show</p>
          <p className="text-gray-400 text-xs mt-1">
            Activities will appear here when members log steps, food, or complete training
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map((item) => (
            <div key={item.id} className={`flex space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
              item.metadata?.isHighlight ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
            }`}>
              {/* Activity Icon */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${item.iconColor} flex-shrink-0 ${
                item.metadata?.isHighlight ? 'ring-2 ring-yellow-300' : ''
              }`}>
                <span className="text-sm">{item.icon}</span>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                {/* Title for milestones */}
                {item.metadata?.title && (
                  <p className={`text-sm font-semibold ${
                    item.metadata?.isHighlight ? 'text-orange-900' : 'text-gray-900'
                  }`}>
                    {item.metadata.title}
                  </p>
                )}
                
                <p className={`text-sm ${
                  item.metadata?.title ? 'text-gray-600' : 'text-gray-900'
                }`}>
                  {item.content}
                </p>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </p>
                  
                  {/* Quick reactions */}
                  <div className="flex space-x-1">
                    {(item.metadata?.isHighlight ? ['🎉', '🔥', '👏'] : ['👏', '🎉', '💪']).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(item.id, emoji)}
                        className="text-xs hover:bg-white rounded px-1 py-0.5 transition-colors"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional metadata display */}
                {item.metadata?.details && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.metadata.details}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Load more button */}
          {feedItems.length === maxItems && (
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  // This would load more items
                  console.log('Load more activities');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Load more activities
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity summary */}
      {feedItems.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {feedItems.filter(item => item.type === 'activity').length}
              </div>
              <div className="text-xs text-gray-500">Activities this week</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {new Set(feedItems.map(item => item.userId)).size}
              </div>
              <div className="text-xs text-gray-500">Active members</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupActivityFeed;