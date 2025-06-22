import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard, BaseCardProps, CardHeader, CardTitle, CardDescription, CardContent } from './BaseCard';
import { cn } from '../../../utils/cn';

interface MetricProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: string;
}

interface DataCardProps extends Omit<BaseCardProps, 'children' | 'layout'> {
  title: string;
  description?: string;
  metrics: MetricProps[];
  chart?: React.ReactNode;
  metricsLayout?: 'horizontal' | 'vertical' | 'grid';
  showTrends?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  description,
  metrics,
  chart,
  metricsLayout = 'vertical',
  showTrends = true,
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
        {/* Metrics Display */}
        <div className={cn(
          'gap-4',
          metricsLayout === 'horizontal' && 'flex items-center justify-between',
          metricsLayout === 'vertical' && 'space-y-4',
          metricsLayout === 'grid' && 'grid grid-cols-2 gap-4'
        )}>
          {metrics.map((metric, index) => (
            <MetricDisplay
              key={index}
              metric={metric}
              showTrend={showTrends}
              layout={metricsLayout}
            />
          ))}
        </div>

        {/* Chart Display */}
        {chart && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            {chart}
          </div>
        )}
      </CardContent>
    </BaseCard>
  );
};

// Metric display component
const MetricDisplay: React.FC<{
  metric: MetricProps;
  showTrend: boolean;
  layout: 'horizontal' | 'vertical' | 'grid';
}> = ({ metric, showTrend, layout }) => {
  const isCompact = layout === 'horizontal' || layout === 'grid';

  return (
    <motion.div
      className={cn(
        'group/metric',
        isCompact ? 'text-center' : 'flex items-center space-x-4'
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      {metric.icon && (
        <div className={cn(
          'flex-shrink-0 rounded-lg flex items-center justify-center',
          isCompact ? 'w-8 h-8 mx-auto mb-2' : 'w-10 h-10',
          metric.color || 'bg-blue-100 text-blue-600'
        )}>
          {metric.icon}
        </div>
      )}

      {/* Content */}
      <div className={cn('flex-1', isCompact && 'text-center')}>
        <div className={cn(
          'font-bold text-gray-900',
          isCompact ? 'text-lg mb-1' : 'text-2xl mb-1'
        )}>
          {metric.value}
        </div>
        
        <div className={cn(
          'text-gray-600',
          isCompact ? 'text-xs' : 'text-sm'
        )}>
          {metric.label}
        </div>

        {/* Trend Indicator */}
        {showTrend && metric.change && (
          <div className="flex items-center justify-center mt-2">
            <TrendIndicator change={metric.change} compact={isCompact} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Trend indicator component
const TrendIndicator: React.FC<{
  change: NonNullable<MetricProps['change']>;
  compact?: boolean;
}> = ({ change, compact = false }) => {
  const { value, period, trend } = change;
  const isPositive = value > 0;
  const isNegative = value < 0;

  const trendColors = {
    up: isPositive ? 'text-green-600' : 'text-red-600',
    down: isNegative ? 'text-green-600' : 'text-red-600',
    neutral: 'text-gray-500'
  };

  const TrendIcon = () => {
    if (trend === 'neutral') {
      return <span className="text-xs">→</span>;
    }
    if ((trend === 'up' && isPositive) || (trend === 'down' && isNegative)) {
      return <span className="text-xs">↗</span>;
    }
    return <span className="text-xs">↘</span>;
  };

  return (
    <div className={cn(
      'flex items-center space-x-1',
      trendColors[trend],
      compact ? 'text-xs' : 'text-sm'
    )}>
      <TrendIcon />
      <span className="font-medium">
        {Math.abs(value)}% {period}
      </span>
    </div>
  );
};

// Quick metric card for single values
export const QuickMetricCard: React.FC<{
  metric: MetricProps;
  onClick?: () => void;
  className?: string;
}> = ({ metric, onClick, className }) => {
  return (
    <BaseCard
      size="sm"
      interactive={!!onClick}
      onClick={onClick}
      className={cn('text-center group', className)}
    >
      <CardContent spacing="sm">
        <MetricDisplay
          metric={metric}
          showTrend={!!metric.change}
          layout="grid"
        />
      </CardContent>
    </BaseCard>
  );
};