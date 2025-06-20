import React, { useState, useEffect } from 'react';

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangeFilterWidgetProps {
  onDateRangeChange: (range: DateRange) => void;
  defaultRange?: string;
  compact?: boolean;
  showPresets?: boolean;
}

const DateRangeFilterWidget: React.FC<DateRangeFilterWidgetProps> = ({
  onDateRangeChange,
  defaultRange = 'last30days',
  compact = false,
  showPresets = true
}) => {
  const [selectedRange, setSelectedRange] = useState<string>(defaultRange);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);

  const presetRanges = [
    {
      id: 'today',
      label: 'Today',
      icon: '📅',
      getDates: () => ({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      icon: '⏪',
      getDates: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        return { startDate: dateStr, endDate: dateStr };
      }
    },
    {
      id: 'last7days',
      label: 'Last 7 Days',
      icon: '📊',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'last30days',
      label: 'Last 30 Days',
      icon: '📈',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'thisweek',
      label: 'This Week',
      icon: '🗓️',
      getDates: () => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        return {
          startDate: monday.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'lastweek',
      label: 'Last Week',
      icon: '⏮️',
      getDates: () => {
        const now = new Date();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - now.getDay() - 6);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        return {
          startDate: lastMonday.toISOString().split('T')[0],
          endDate: lastSunday.toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'thismonth',
      label: 'This Month',
      icon: '🌙',
      getDates: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'lastmonth',
      label: 'Last Month',
      icon: '⏭️',
      getDates: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'last90days',
      label: 'Last 90 Days',
      icon: '📊',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 89);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'thisyear',
      label: 'This Year',
      icon: '🗓️',
      getDates: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };
      }
    },
    {
      id: 'alltime',
      label: 'All Time',
      icon: '♾️',
      getDates: () => {
        // Assuming app started on Jan 1, 2024
        return {
          startDate: '2024-01-01',
          endDate: new Date().toISOString().split('T')[0]
        };
      }
    }
  ];

  useEffect(() => {
    handleRangeChange(selectedRange);
  }, [selectedRange]);

  const handleRangeChange = (rangeId: string) => {
    if (rangeId === 'custom') {
      setShowCustom(true);
      setSelectedRange(rangeId);
      return;
    }

    const preset = presetRanges.find(p => p.id === rangeId);
    if (preset) {
      const dates = preset.getDates();
      const range: DateRange = {
        startDate: dates.startDate,
        endDate: dates.endDate,
        label: preset.label
      };
      onDateRangeChange(range);
      setSelectedRange(rangeId);
      setShowCustom(false);
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const range: DateRange = {
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
      };
      onDateRangeChange(range);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const validateCustomDates = () => {
    if (!customStartDate || !customEndDate) return false;
    return new Date(customStartDate) <= new Date(customEndDate);
  };

  const getCurrentRangeLabel = () => {
    if (selectedRange === 'custom' && customStartDate && customEndDate) {
      return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
    }
    const preset = presetRanges.find(p => p.id === selectedRange);
    return preset ? preset.label : 'Select Range';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Date Range</h3>
          <span className="text-xl">📅</span>
        </div>

        <div className="space-y-2">
          <select
            value={selectedRange}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {presetRanges.slice(0, 6).map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom Range</option>
          </select>

          {showCustom && (
            <div className="space-y-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                placeholder="Start date"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                placeholder="End date"
              />
              <button
                onClick={handleCustomDateChange}
                disabled={!validateCustomDates()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Custom Range
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 text-center">
          {getCurrentRangeLabel()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Date Range Filter</h3>
        <span className="text-2xl">📅</span>
      </div>

      {/* Current Selection Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Current Range</h4>
            <p className="text-blue-700">{getCurrentRangeLabel()}</p>
          </div>
          <div className="text-blue-600">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      {/* Preset Ranges */}
      {showPresets && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Quick Select</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {presetRanges.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleRangeChange(preset.id)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  selectedRange === preset.id && !showCustom
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{preset.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{preset.label}</p>
                    <p className={`text-xs ${
                      selectedRange === preset.id && !showCustom ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {(() => {
                        const dates = preset.getDates();
                        if (dates.startDate === dates.endDate) {
                          return formatDate(dates.startDate);
                        }
                        return `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`;
                      })()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Range */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Custom Range</h4>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              showCustom
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showCustom ? 'Hide' : 'Show'} Custom
          </button>
        </div>

        {showCustom && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {customStartDate && customEndDate && validateCustomDates() && (
                  <span>
                    Range: {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </span>
                )}
              </div>
              <button
                onClick={handleCustomDateChange}
                disabled={!validateCustomDates()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Custom Range
              </button>
            </div>

            {customStartDate && customEndDate && !validateCustomDates() && (
              <div className="text-red-600 text-sm">
                End date must be after start date
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular Ranges */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Popular Choices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'last7days', reason: 'Perfect for weekly progress tracking' },
            { id: 'last30days', reason: 'Great for monthly trend analysis' },
            { id: 'thismonth', reason: 'See current month performance' },
            { id: 'last90days', reason: 'Ideal for quarterly reviews' }
          ].map(popular => {
            const preset = presetRanges.find(p => p.id === popular.id);
            if (!preset) return null;

            return (
              <button
                key={popular.id}
                onClick={() => handleRangeChange(popular.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedRange === popular.id && !showCustom
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{preset.icon}</span>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{preset.label}</h5>
                    <p className="text-xs text-gray-600 mt-1">{popular.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const dates = preset.getDates();
                        return `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`;
                      })()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => handleRangeChange(defaultRange)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium"
        >
          Reset to Default ({presetRanges.find(p => p.id === defaultRange)?.label})
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilterWidget;