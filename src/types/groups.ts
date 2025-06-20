// Group and team management types for the social wellness features

export type GroupRole = 'member' | 'sponsor' | 'super_admin';
export type GroupStatus = 'active' | 'inactive' | 'pending';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ActivityType = 'steps' | 'food_entry' | 'training_completion' | 'group_interaction';

// Core Group/Team Structure
export interface Group {
  id: string;
  name: string;
  description: string;
  inviteCode: string; // 6-character unique code
  sponsorId: string; // User ID of the team sponsor (admin)
  status: GroupStatus;
  maxMembers: number; // Default 10
  currentMemberCount: number;
  createdAt: Date;
  updatedAt: Date;
  settings: GroupSettings;
}

export interface GroupSettings {
  isPublic: boolean; // Can be found in search
  requireApproval: boolean; // Sponsor must approve joins
  allowMemberInvites: boolean; // Members can invite others
  activityGoals: {
    dailyStepsGoal: number;
    weeklyFoodEntriesGoal: number;
    monthlyTrainingModulesGoal: number;
  };
  notifications: {
    newMemberJoins: boolean;
    memberAchievements: boolean;
    groupChallenges: boolean;
    inactiveMembers: boolean;
  };
}

// Group Membership
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  lastActiveAt: Date;
  isEligible: boolean; // Met 7-day activity + training requirements
  activityStats: MemberActivityStats;
  achievements: MemberAchievement[];
}

export interface MemberActivityStats {
  userId: string;
  groupId: string;
  last7DaysActive: boolean;
  totalStepsLogged: number;
  totalFoodEntriesLogged: number;
  trainingModulesCompleted: number;
  groupInteractions: number; // Messages, reactions, etc.
  weeklyStreaks: {
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string;
  };
  lastUpdated: Date;
}

// Group Invitations
export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedByUserId: string;
  invitedUserEmail?: string; // For email invites
  invitedUserId?: string; // For direct user invites
  inviteCode: string; // Copy of group invite code at time of invite
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  message?: string; // Personal message from inviter
}

// Activity Tracking
export interface UserActivity {
  id: string;
  userId: string;
  groupId?: string; // Optional - can track activity outside groups too
  activityType: ActivityType;
  activityDate: string; // YYYY-MM-DD format
  metadata: ActivityMetadata;
  createdAt: Date;
}

export interface ActivityMetadata {
  steps?: number;
  foodEntries?: number;
  trainingModule?: string;
  groupInteraction?: {
    type: 'message' | 'reaction' | 'achievement_share';
    targetId: string;
  };
}

// Group Activity Feed
export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  activityType: 'member_joined' | 'achievement_earned' | 'goal_reached' | 'milestone_hit' | 'challenge_completed';
  content: string; // Formatted message
  metadata: {
    achievement?: MemberAchievement;
    milestone?: GroupMilestone;
    stats?: any;
  };
  createdAt: Date;
  reactions: ActivityReaction[];
}

export interface ActivityReaction {
  id: string;
  activityId: string;
  userId: string;
  emoji: string; // 👏, 🎉, 💪, ❤️, etc.
  createdAt: Date;
}

// Achievements System
export interface MemberAchievement {
  id: string;
  userId: string;
  groupId: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  iconEmoji: string;
  earnedAt: Date;
  isSharedWithGroup: boolean;
}

export type AchievementType = 
  | 'first_week_complete' 
  | 'step_goal_streak'
  | 'food_logging_champion'
  | 'training_graduate'
  | 'group_motivator'
  | 'consistency_king'
  | 'milestone_crusher';

// Group Challenges/Milestones
export interface GroupMilestone {
  id: string;
  groupId: string;
  milestoneType: 'total_steps' | 'total_food_entries' | 'member_retention' | 'training_completion';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string; // Description of reward/recognition
}

// Group Chat/Messaging (Basic)
export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'achievement_share' | 'system_notification';
  replyToId?: string; // For threaded replies
  createdAt: Date;
  editedAt?: Date;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Group Statistics & Analytics
export interface GroupStats {
  groupId: string;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  totalMembers: number;
  activeMembers: number; // Logged activity in period
  totalSteps: number;
  totalFoodEntries: number;
  totalTrainingModules: number;
  avgDailySteps: number;
  memberRetentionRate: number; // % of members active in last 7 days
  topPerformers: Array<{
    userId: string;
    metric: 'steps' | 'food_entries' | 'consistency';
    value: number;
  }>;
  generatedAt: Date;
}

// Eligibility Checking
export interface EligibilityCheck {
  userId: string;
  groupId?: string;
  canCreateGroup: boolean;
  canJoinGroup: boolean;
  requirements: {
    sevenDayActivity: {
      met: boolean;
      daysActive: number;
      requiredDays: 7;
    };
    trainingCompletion: {
      met: boolean;
      modulesCompleted: number;
      requiredModules: number;
    };
  };
  checkedAt: Date;
}

// Super Admin Dashboard Data
export interface SuperAdminStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  activeMembers: number;
  groupGrowthTrend: Array<{
    date: string;
    newGroups: number;
    newMembers: number;
  }>;
  topPerformingGroups: Array<{
    groupId: string;
    groupName: string;
    memberCount: number;
    activityScore: number;
  }>;
  systemHealth: {
    avgGroupSize: number;
    memberRetentionRate: number;
    avgActivityPerMember: number;
  };
}

// API Response Types
export interface CreateGroupRequest {
  name: string;
  description: string;
  settings: Partial<GroupSettings>;
}

export interface CreateGroupResponse {
  group: Group;
  invitation: GroupInvitation;
  member: GroupMember;
}

export interface JoinGroupRequest {
  inviteCode: string;
  message?: string;
}

export interface JoinGroupResponse {
  group: Group;
  member: GroupMember;
  eligibilityStatus: EligibilityCheck;
}

// Local Storage Keys
export const GROUP_STORAGE_KEYS = {
  USER_GROUPS: 'wellness_user_groups',
  GROUP_MEMBERS: 'wellness_group_members',
  GROUP_ACTIVITY: 'wellness_group_activity',
  USER_ELIGIBILITY: 'wellness_user_eligibility',
  GROUP_INVITATIONS: 'wellness_group_invitations',
  GROUP_MESSAGES: 'wellness_group_messages',
  MEMBER_ACHIEVEMENTS: 'wellness_member_achievements',
} as const;