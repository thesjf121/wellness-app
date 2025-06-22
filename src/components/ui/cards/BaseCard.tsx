import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../../utils/cn';

export interface BaseCardProps extends MotionProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  interactive = false,
  loading = false,
  disabled = false,
  ...motionProps
}) => {
  const baseClasses = 'rounded-lg md:rounded-xl transition-all duration-300 relative overflow-hidden';
  
  const variantClasses = {
    default: 'bg-white border border-gray-100 shadow-sm hover:shadow-md md:shadow-lg md:hover:shadow-xl',
    elevated: 'bg-white shadow-lg hover:shadow-xl md:shadow-xl md:hover:shadow-2xl',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl md:bg-white/70',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-gray-100 shadow-lg md:shadow-md',
    outline: 'bg-transparent border-2 border-gray-200 hover:border-gray-300 shadow-sm md:shadow-none'
  };
  
  const sizeClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    xl: 'p-8 md:p-10'
  };
  
  const interactiveClasses = interactive && !disabled
    ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98] hover:shadow-lg'
    : '';
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        disabledClasses,
        className
      )}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={interactive && !disabled ? { y: -4 } : {}}
      whileTap={interactive && !disabled ? { scale: 0.98 } : {}}
      {...motionProps}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </motion.div>
  );
};

// Card sections for consistent layout
export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  action?: React.ReactNode;
}> = ({ children, className, action }) => (
  <div className={cn('flex items-start justify-between mb-6', className)}>
    <div className="flex-1">{children}</div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold'
  };
  
  return (
    <h3 className={cn(sizeClasses[size], 'text-gray-900 leading-tight', className)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <p className={cn('text-sm text-gray-600 mt-2 leading-relaxed', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}> = ({ children, className, spacing = 'md' }) => {
  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };
  
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'actions' | 'stats';
}> = ({ children, className, variant = 'default' }) => {
  const variantClasses = {
    default: 'mt-6 pt-4 border-t border-gray-100',
    actions: 'mt-6 flex items-center justify-between',
    stats: 'mt-4 grid grid-cols-2 gap-4 text-center'
  };
  
  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
};