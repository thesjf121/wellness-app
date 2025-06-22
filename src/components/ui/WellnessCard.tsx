import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface WellnessCardProps extends MotionProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const WellnessCard: React.FC<WellnessCardProps> = ({
  children,
  variant = 'primary',
  padding = 'md',
  className,
  onClick,
  interactive = false,
  ...motionProps
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    primary: 'bg-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-50 border border-gray-100',
    glass: 'bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const interactiveClasses = interactive ? 'cursor-pointer active:scale-[0.98]' : '';
  
  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={interactive ? { y: -2 } : {}}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// Compound components for card sections
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h3 className={cn('text-xl font-semibold text-gray-900', className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>
    {children}
  </div>
);