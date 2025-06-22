import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  colors?: {
    background?: string;
    progress?: string | string[]; // Single color or gradient array
    text?: string;
  };
  className?: string;
  children?: React.ReactNode; // Custom center content
}

const sizeMap = {
  sm: { width: 80, fontSize: 'text-lg' },
  md: { width: 120, fontSize: 'text-2xl' },
  lg: { width: 160, fontSize: 'text-3xl' },
  xl: { width: 200, fontSize: 'text-4xl' }
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 'md',
  strokeWidth = 8,
  showValue = true,
  label,
  colors = {},
  className = '',
  children
}) => {
  const {
    background = '#E5E7EB',
    progress = '#3B82F6',
    text = '#1F2937'
  } = colors;

  const { width, fontSize } = sizeMap[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Create gradient ID for multi-color progress
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const isGradient = Array.isArray(progress);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        <defs>
          {isGradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {progress.map((color, index) => (
                <stop
                  key={index}
                  offset={`${(index / (progress.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={background}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={isGradient ? `url(#${gradientId})` : progress}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showValue && (
              <motion.span
                className={`${fontSize} font-bold`}
                style={{ color: text }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {Math.round(value)}%
              </motion.span>
            )}
            {label && (
              <span className="text-sm text-gray-600 mt-1">{label}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Compound component for multiple progress rings
interface ProgressRing {
  value: number;
  color: string;
  label: string;
}

interface MultiProgressProps {
  rings: ProgressRing[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  centerContent?: React.ReactNode;
}

export const MultiProgress: React.FC<MultiProgressProps> = ({
  rings,
  size = 'md',
  strokeWidth = 6,
  centerContent
}) => {
  const { width } = sizeMap[size];
  const maxRadius = (width - strokeWidth) / 2;
  const radiusStep = (strokeWidth + 4);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={width} className="transform -rotate-90">
        {rings.map((ring, index) => {
          const radius = maxRadius - (index * radiusStep);
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (ring.value / 100) * circumference;

          return (
            <g key={index}>
              {/* Background circle */}
              <circle
                cx={width / 2}
                cy={width / 2}
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.3}
              />
              
              {/* Progress circle */}
              <motion.circle
                cx={width / 2}
                cy={width / 2}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeInOut', delay: index * 0.1 }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Center content */}
      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
};