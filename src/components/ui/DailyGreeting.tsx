import React from 'react';
import { motion } from 'framer-motion';
import { WellnessCard } from './WellnessCard';

interface DailyGreetingProps {
  userName: string;
  className?: string;
}

export const DailyGreeting: React.FC<DailyGreetingProps> = ({ 
  userName, 
  className = '' 
}) => {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date formatted nicely
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Daily wellness quotes inspired by Headspace/Calm
  const dailyQuotes = [
    "Every small step counts on your wellness journey.",
    "Progress, not perfection, is the goal.",
    "Your health is an investment, not an expense.",
    "Wellness is not a destination, it's a way of life.",
    "Small changes lead to big transformations.",
    "Be present. Be mindful. Be you.",
    "Consistency is the key to lasting change.",
    "Listen to your body, honor your needs.",
    "Growth begins at the end of your comfort zone.",
    "Today is a new opportunity to care for yourself.",
    "Breathe in calm, breathe out stress.",
    "You are exactly where you need to be.",
    "Kindness to yourself is the first step.",
    "Every moment is a fresh beginning.",
    "Trust the process, embrace the journey."
  ];
  
  const todaysQuote = dailyQuotes[new Date().getDate() % dailyQuotes.length];

  // Get appropriate emoji for time of day
  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      <WellnessCard 
        variant="glass" 
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-0"
      >
        <div className="text-center space-y-4">
          <motion.div 
            className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          >
            <span className="text-2xl">{getGreetingEmoji()}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-sm text-gray-500 mb-2">
              {getCurrentDate()}
            </p>
            <motion.p 
              className="text-gray-600 italic max-w-md mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              "{todaysQuote}"
            </motion.p>
          </motion.div>
        </div>
      </WellnessCard>
    </motion.div>
  );
};