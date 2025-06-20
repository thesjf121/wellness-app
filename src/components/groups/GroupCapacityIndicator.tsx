import React from 'react';

interface GroupCapacityIndicatorProps {
  currentMembers: number;
  maxMembers: number;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const GroupCapacityIndicator: React.FC<GroupCapacityIndicatorProps> = ({
  currentMembers,
  maxMembers,
  showDetails = true,
  size = 'medium',
  className = ''
}) => {
  const spotsRemaining = maxMembers - currentMembers;
  const percentageFull = (currentMembers / maxMembers) * 100;
  const isFull = currentMembers >= maxMembers;
  const isNearlyFull = percentageFull >= 80;

  // Size configurations
  const sizeConfig = {
    small: {
      height: 'h-1',
      text: 'text-xs',
      spacing: 'space-y-1'
    },
    medium: {
      height: 'h-2',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    large: {
      height: 'h-3',
      text: 'text-base',
      spacing: 'space-y-3'
    }
  };

  const config = sizeConfig[size];

  // Color scheme based on capacity
  const getColorScheme = () => {
    if (isFull) {
      return {
        bg: 'bg-red-500',
        text: 'text-red-700',
        bgLight: 'bg-red-50',
        icon: '🚫'
      };
    } else if (isNearlyFull) {
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-700',
        bgLight: 'bg-yellow-50',
        icon: '⚠️'
      };
    } else {
      return {
        bg: 'bg-green-500',
        text: 'text-green-700',
        bgLight: 'bg-green-50',
        icon: '✅'
      };
    }
  };

  const colors = getColorScheme();

  const getStatusMessage = () => {
    if (isFull) {
      return 'Group is full';
    } else if (isNearlyFull) {
      return `Only ${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} remaining`;
    } else {
      return `${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} available`;
    }
  };

  return (
    <div className={`${className} ${config.spacing}`}>
      {/* Progress Bar */}
      <div className="flex items-center space-x-3">
        {showDetails && (
          <span className={`${config.text} font-medium ${colors.text}`}>
            {currentMembers}/{maxMembers}
          </span>
        )}
        
        <div className={`flex-1 bg-gray-200 rounded-full ${config.height}`}>
          <div 
            className={`${colors.bg} ${config.height} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentageFull, 100)}%` }}
          ></div>
        </div>

        {showDetails && !isFull && (
          <span className={`${config.text} ${colors.text}`}>
            {spotsRemaining} left
          </span>
        )}
      </div>

      {/* Status Message */}
      {showDetails && (
        <div className={`flex items-center space-x-2 ${config.text}`}>
          <span>{colors.icon}</span>
          <span className={colors.text}>{getStatusMessage()}</span>
        </div>
      )}

      {/* Warning for nearly full groups */}
      {showDetails && isNearlyFull && !isFull && (
        <div className={`${colors.bgLight} border border-yellow-200 rounded-lg p-2 ${config.text}`}>
          <p className="text-yellow-800">
            <strong>Almost full!</strong> Join soon to secure your spot in this group.
          </p>
        </div>
      )}

      {/* Full group message */}
      {showDetails && isFull && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className={`text-red-800 ${config.text}`}>
            <strong>Group is full.</strong> You can ask the sponsor to notify you if a spot opens up.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupCapacityIndicator;