import React from 'react';
import { motion } from 'framer-motion';
import { WellnessCard, CardHeader, CardTitle, CardDescription, CardContent } from './WellnessCard';
import { CircularProgress } from './CircularProgress';

interface ProgressItem {
  label: string;
  value: number;
  max: number;
  colors: string[];
  icon: string;
  subtitle?: string;
}

interface ProgressSummaryProps {
  title?: string;
  description?: string;
  items: ProgressItem[];
  className?: string;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  title = "Today's Progress",
  description = "Your wellness journey at a glance",
  items,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={className}
    >
      <WellnessCard variant="primary">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item, index) => (
              <motion.div 
                key={item.label}
                className="text-center space-y-3"
                variants={itemVariants}
              >
                <div className="relative">
                  <CircularProgress 
                    value={(item.value / item.max) * 100} 
                    size="md" 
                    colors={{
                      progress: item.colors,
                      background: '#E5E7EB',
                      text: '#1F2937'
                    }}
                    showValue={false}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-sm font-bold text-gray-900">
                        {item.value.toLocaleString()}
                      </div>
                      {item.max > 0 && (
                        <div className="text-xs text-gray-500">
                          of {item.max.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CircularProgress>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </WellnessCard>
    </motion.div>
  );
};

// Helper function to create progress items
export const createProgressItem = (
  label: string,
  value: number,
  max: number,
  colors: string[],
  icon: string,
  subtitle?: string
): ProgressItem => ({
  label,
  value,
  max,
  colors,
  icon,
  subtitle
});