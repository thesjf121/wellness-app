import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard, BaseCardProps, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './BaseCard';
import { cn } from '../../../utils/cn';

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    timeframe: string;
  };
  color?: string;
  icon?: React.ReactNode;
}

interface StatsCardProps extends Omit<BaseCardProps, 'children' | 'layout'> {
  title: string;
  description?: string;
  stats: StatItem[];
  statsLayout?: 'row' | 'grid' | 'list';
  showChart?: boolean;
  chartComponent?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  description,
  stats,
  statsLayout = 'grid',
  showChart = false,
  chartComponent,
  actions,
  className,
  ...baseProps
}) => {
  return (
    <BaseCard className={cn('group', className)} {...baseProps}>
      <CardHeader>
        <CardTitle size="md">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent spacing="lg">
        {/* Stats Display */}
        <StatsDisplay stats={stats} layout={statsLayout} />

        {/* Chart Section */}
        {showChart && chartComponent && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="h-48">
              {chartComponent}
            </div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <CardFooter variant="actions">
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <ActionButton key={index} {...action} />
            ))}
          </div>
        </CardFooter>
      )}
    </BaseCard>
  );
};

// Stats display with different layouts
const StatsDisplay: React.FC<{
  stats: StatItem[];
  layout: 'row' | 'grid' | 'list';
}> = ({ stats, layout }) => {
  const layoutClasses = {
    row: 'flex items-center justify-between space-x-4',
    grid: 'grid grid-cols-2 gap-4',
    list: 'space-y-4'
  };

  return (
    <div className={layoutClasses[layout]}>
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          stat={stat}
          layout={layout}
          index={index}
        />
      ))}
    </div>
  );
};

// Individual stat item
const StatItem: React.FC<{
  stat: StatItem;
  layout: 'row' | 'grid' | 'list';
  index: number;
}> = ({ stat, layout, index }) => {
  const isCompact = layout === 'row' || layout === 'grid';
  
  return (
    <motion.div
      className={cn(
        'group/stat relative',
        isCompact ? 'text-center' : 'flex items-center space-x-4',
        layout === 'list' && 'p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon */}
      {stat.icon && (
        <div className={cn(
          'flex-shrink-0 rounded-lg flex items-center justify-center',
          isCompact ? 'w-10 h-10 mx-auto mb-3' : 'w-12 h-12',
          stat.color || 'bg-blue-100 text-blue-600'
        )}>
          {stat.icon}
        </div>
      )}

      {/* Content */}
      <div className={cn('flex-1', isCompact && 'text-center')}>
        {/* Value */}
        <div className={cn(
          'font-bold text-gray-900 leading-none',
          isCompact ? 'text-2xl mb-1' : 'text-3xl mb-2'
        )}>
          <span>{stat.value}</span>
          {stat.unit && (
            <span className={cn(
              'text-gray-500 font-normal ml-1',
              isCompact ? 'text-sm' : 'text-lg'
            )}>
              {stat.unit}
            </span>
          )}
        </div>

        {/* Label */}
        <div className={cn(
          'text-gray-600 font-medium',
          isCompact ? 'text-sm' : 'text-base'
        )}>
          {stat.label}
        </div>

        {/* Trend */}
        {stat.trend && (
          <div className="mt-2">
            <TrendBadge trend={stat.trend} size={isCompact ? 'sm' : 'md'} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Trend badge component
const TrendBadge: React.FC<{
  trend: NonNullable<StatItem['trend']>;
  size?: 'sm' | 'md';
}> = ({ trend, size = 'md' }) => {
  const { direction, value, timeframe } = trend;
  
  const directionStyles = {
    up: 'bg-green-100 text-green-700',
    down: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1'
  };

  const TrendIcon = () => {
    switch (direction) {
      case 'up':
        return <span className="mr-1">↗</span>;
      case 'down':
        return <span className="mr-1">↘</span>;
      default:
        return <span className="mr-1">→</span>;
    }
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        directionStyles[direction],
        sizeStyles[size]
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <TrendIcon />
      {value}% {timeframe}
    </motion.div>
  );
};

// Action button component
const ActionButton: React.FC<{
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}> = ({ label, onClick, variant = 'secondary' }) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        variantStyles[variant]
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.button>
  );
};

// Compact stats card for dashboard widgets
export const CompactStatsCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  trend?: StatItem['trend'];
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
}> = ({ title, value, unit, trend, icon, color, onClick, className }) => {
  return (
    <BaseCard
      size="sm"
      interactive={!!onClick}
      onClick={onClick}
      className={cn('text-center group hover:shadow-lg', className)}
    >
      <CardContent spacing="sm">
        <StatItem
          stat={{ label: title, value, unit, trend, icon, color }}
          layout="grid"
          index={0}
        />
      </CardContent>
    </BaseCard>
  );
};