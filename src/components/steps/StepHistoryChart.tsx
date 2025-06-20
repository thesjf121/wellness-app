import React from 'react';
import { StepChartData } from '../../types/steps';

interface StepHistoryChartProps {
  data: StepChartData[];
  period: '7day' | '30day';
  goal: number;
}

export const StepHistoryChart: React.FC<StepHistoryChartProps> = ({ 
  data, 
  period, 
  goal 
}) => {
  const maxSteps = Math.max(...data.map(d => d.steps), goal);
  const chartHeight = 200;

  const getBarHeight = (steps: number) => {
    return (steps / maxSteps) * chartHeight;
  };

  const getDateLabel = (date: string) => {
    const d = new Date(date);
    if (period === '7day') {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.getDate().toString();
    }
  };

  const formatSteps = (steps: number) => {
    if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {period === '7day' ? 'Last 7 Days' : 'Last 30 Days'}
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Steps</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-red-400 mr-2"></div>
            <span className="text-gray-600">Goal ({formatSteps(goal)})</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Goal line */}
        <div 
          className="absolute w-full border-t-2 border-red-400 border-dashed z-10"
          style={{
            bottom: `${(goal / maxSteps) * chartHeight}px`
          }}
        >
          <span className="absolute -top-6 right-0 text-xs text-red-600 bg-white px-1">
            Goal
          </span>
        </div>

        {/* Chart container */}
        <div 
          className="flex items-end justify-between space-x-1 bg-gray-50 p-4 rounded"
          style={{ height: chartHeight + 60 }}
        >
          {data.map((entry, index) => (
            <div key={entry.date} className="flex flex-col items-center flex-1">
              {/* Bar */}
              <div className="relative flex flex-col items-center w-full">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    entry.goalReached 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{
                    height: `${getBarHeight(entry.steps)}px`,
                    minHeight: entry.steps > 0 ? '8px' : '0px'
                  }}
                  title={`${entry.steps.toLocaleString()} steps`}
                >
                  {/* Steps count on hover/mobile */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {entry.steps.toLocaleString()} steps
                  </div>
                </div>
              </div>

              {/* Date label */}
              <div className="mt-2 text-xs text-gray-600 text-center">
                {getDateLabel(entry.date)}
              </div>

              {/* Goal indicator */}
              {entry.goalReached && (
                <div className="mt-1">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{formatSteps(maxSteps)}</span>
          <span>{formatSteps(Math.round(maxSteps * 0.75))}</span>
          <span>{formatSteps(Math.round(maxSteps * 0.5))}</span>
          <span>{formatSteps(Math.round(maxSteps * 0.25))}</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {data.reduce((sum, d) => sum + d.steps, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Steps</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(data.reduce((sum, d) => sum + d.steps, 0) / data.length).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {data.filter(d => d.goalReached).length}/{data.length}
          </div>
          <div className="text-sm text-gray-600">Goals Reached</div>
        </div>
      </div>
    </div>
  );
};