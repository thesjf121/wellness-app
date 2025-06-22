import React from 'react';
import { BaseCard, CardHeader, CardTitle, CardContent } from './BaseCard';
import { DataCard, QuickMetricCard } from './DataCard';
import { Activity, Heart, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileCardDemo: React.FC = () => {
  const sampleMetrics = [
    {
      label: "Steps Today",
      value: "8,432",
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600',
      change: {
        value: 12,
        period: 'vs yesterday',
        trend: 'up' as 'up'
      }
    },
    {
      label: "Heart Rate",
      value: "72 BPM",
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-red-100 text-red-600'
    },
    {
      label: "Goal Progress",
      value: "87%",
      icon: <Target className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600',
      change: {
        value: 87,
        period: 'daily goal',
        trend: 'up' as 'up'
      }
    }
  ];

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen md:min-h-0 md:bg-white md:p-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Card UI Showcase</h2>
        <p className="text-gray-600 text-sm">Optimized for mobile viewing</p>
      </motion.div>

      {/* Card Variants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 px-2">Card Variants</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <BaseCard variant="elevated" className="transform hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle size="sm">Elevated Card</CardTitle>
            </CardHeader>
            <CardContent spacing="sm">
              <p className="text-sm text-gray-600">Enhanced shadows and depth for mobile</p>
            </CardContent>
          </BaseCard>

          <BaseCard variant="glass" className="transform hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle size="sm">Glass Card</CardTitle>
            </CardHeader>
            <CardContent spacing="sm">
              <p className="text-sm text-gray-600">Frosted glass effect with backdrop blur</p>
            </CardContent>
          </BaseCard>

          <BaseCard variant="gradient" className="transform hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle size="sm">Gradient Card</CardTitle>
            </CardHeader>
            <CardContent spacing="sm">
              <p className="text-sm text-gray-600">Subtle gradient background</p>
            </CardContent>
          </BaseCard>
        </div>
      </motion.div>

      {/* Quick Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 px-2">Quick Metrics</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {sampleMetrics.map((metric, index) => (
            <QuickMetricCard key={index} metric={metric} />
          ))}
        </div>
      </motion.div>

      {/* Data Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 px-2">Data Visualization</h3>
        
        <DataCard
          title="Weekly Progress"
          description="Your wellness journey this week"
          metrics={sampleMetrics}
          metricsLayout="vertical"
          variant="elevated"
          chart={
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Weekly Goal</span>
                <span className="text-green-600 font-semibold">84%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" style={{ width: '84%' }} />
              </div>
              <div className="text-xs text-gray-500 text-center">6 of 7 daily goals completed</div>
            </div>
          }
        />
      </motion.div>

      {/* Interactive Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 pb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 px-2">Interactive Cards</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <BaseCard 
            variant="outline" 
            interactive={true}
            className="text-center"
            onClick={() => alert('Card clicked!')}
          >
            <CardContent spacing="sm">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Tap Me</p>
              <p className="text-xs text-gray-500">Interactive</p>
            </CardContent>
          </BaseCard>

          <BaseCard 
            variant="gradient" 
            interactive={true}
            className="text-center"
            onClick={() => alert('Another card!')}
          >
            <CardContent spacing="sm">
              <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Touch Me</p>
              <p className="text-xs text-gray-500">Responsive</p>
            </CardContent>
          </BaseCard>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileCardDemo;