import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard, BaseCardProps, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './BaseCard';
import { cn } from '../../../utils/cn';

interface ActionCardProps extends Omit<BaseCardProps, 'children'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  content?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  };
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  content,
  badge,
  className,
  ...baseProps
}) => {
  return (
    <BaseCard
      className={cn('group', className)}
      interactive={!!primaryAction?.onClick}
      onClick={primaryAction?.onClick}
      {...baseProps}
    >
      <CardHeader>
        <div className="flex items-start space-x-4">
          {icon && (
            <motion.div 
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle size="md">{title}</CardTitle>
              {badge && (
                <Badge variant={badge.variant}>
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      {content && (
        <CardContent>
          {content}
        </CardContent>
      )}

      {(primaryAction || secondaryAction) && (
        <CardFooter variant="actions">
          <div className="flex space-x-3">
            {secondaryAction && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  secondaryAction.onClick();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {secondaryAction.label}
              </motion.button>
            )}
            {primaryAction && (
              <ActionButton
                {...primaryAction}
                onClick={(e) => {
                  e.stopPropagation();
                  primaryAction.onClick();
                }}
              />
            )}
          </div>
        </CardFooter>
      )}
    </BaseCard>
  );
};

// Helper components
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}> = ({ children, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant]
    )}>
      {children}
    </span>
  );
};

const ActionButton: React.FC<{
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}> = ({ label, onClick, variant = 'primary', loading = false }) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant]
      )}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        label
      )}
    </motion.button>
  );
};