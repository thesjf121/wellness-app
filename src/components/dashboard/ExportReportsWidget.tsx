import React, { useState } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';

interface ExportOptions {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  includeSteps: boolean;
  includeNutrition: boolean;
  includeTraining: boolean;
  includeStreaks: boolean;
  includeAchievements: boolean;
  format: 'pdf' | 'csv' | 'excel';
}

interface ExportReportsWidgetProps {
  compact?: boolean;
  isAdmin?: boolean;
}

const ExportReportsWidget: React.FC<ExportReportsWidgetProps> = ({ 
  compact = false, 
  isAdmin = false 
}) => {
  const { user } = useMockAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dateRange: 'month',
    includeSteps: true,
    includeNutrition: true,
    includeTraining: true,
    includeStreaks: true,
    includeAchievements: true,
    format: 'pdf'
  });

  const handleQuickExport = async (type: 'personal' | 'group' | 'full') => {
    setIsExporting(true);
    
    // Simulate export process
    try {
      const data = generateReportData(type);
      const filename = `wellness-report-${type}-${new Date().toISOString().split('T')[0]}`;
      
      // Simulate file generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (exportOptions.format === 'pdf') {
        downloadPDFReport(data, filename);
      } else if (exportOptions.format === 'csv') {
        downloadCSVReport(data, filename);
      } else {
        downloadExcelReport(data, filename);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportData = (type: 'personal' | 'group' | 'full') => {
    const baseData = {
      user: user?.firstName || 'User',
      reportType: type,
      dateRange: exportOptions.dateRange,
      generatedAt: new Date().toISOString()
    };

    if (exportOptions.includeSteps) {
      Object.assign(baseData, {
        steps: {
          totalSteps: Math.floor(Math.random() * 50000) + 100000,
          averageDaily: Math.floor(Math.random() * 5000) + 7000,
          goalAchievement: Math.floor(Math.random() * 40) + 60,
          longestStreak: Math.floor(Math.random() * 15) + 5
        }
      });
    }

    if (exportOptions.includeNutrition) {
      Object.assign(baseData, {
        nutrition: {
          averageCalories: Math.floor(Math.random() * 500) + 1800,
          waterIntake: Math.floor(Math.random() * 20) + 60,
          mealsLogged: Math.floor(Math.random() * 50) + 100,
          macroBalance: {
            protein: Math.floor(Math.random() * 10) + 20,
            carbs: Math.floor(Math.random() * 15) + 45,
            fats: Math.floor(Math.random() * 10) + 25
          }
        }
      });
    }

    if (exportOptions.includeTraining) {
      Object.assign(baseData, {
        training: {
          modulesCompleted: Math.floor(Math.random() * 6) + 2,
          totalModules: 8,
          timeSpent: Math.floor(Math.random() * 300) + 120,
          certificates: Math.floor(Math.random() * 3) + 1
        }
      });
    }

    if (exportOptions.includeStreaks) {
      Object.assign(baseData, {
        streaks: {
          currentStreak: Math.floor(Math.random() * 15) + 1,
          longestStreak: Math.floor(Math.random() * 20) + 10,
          totalStreaks: Math.floor(Math.random() * 10) + 5
        }
      });
    }

    if (exportOptions.includeAchievements) {
      Object.assign(baseData, {
        achievements: {
          badgesEarned: Math.floor(Math.random() * 10) + 5,
          totalBadges: 20,
          rarebadges: Math.floor(Math.random() * 3) + 1,
          recentAchievements: [
            'Step Warrior',
            'Hydration Hero',
            'Wellness Student'
          ]
        }
      });
    }

    return baseData;
  };

  const downloadPDFReport = (data: any, filename: string) => {
    // Simulate PDF generation
    const pdfContent = `
Wellness Report - ${data.reportType.toUpperCase()}
Generated: ${new Date(data.generatedAt).toLocaleDateString()}
User: ${data.user}

${data.steps ? `
STEP TRACKING
=============
Total Steps: ${data.steps.totalSteps.toLocaleString()}
Daily Average: ${data.steps.averageDaily.toLocaleString()}
Goal Achievement: ${data.steps.goalAchievement}%
Longest Streak: ${data.steps.longestStreak} days
` : ''}

${data.nutrition ? `
NUTRITION
=========
Average Calories: ${data.nutrition.averageCalories}
Water Intake: ${data.nutrition.waterIntake}% of goal
Meals Logged: ${data.nutrition.mealsLogged}
Macro Balance: ${data.nutrition.macroBalance.protein}% protein, ${data.nutrition.macroBalance.carbs}% carbs, ${data.nutrition.macroBalance.fats}% fats
` : ''}

${data.training ? `
TRAINING
========
Modules Completed: ${data.training.modulesCompleted}/${data.training.totalModules}
Time Spent: ${data.training.timeSpent} minutes
Certificates: ${data.training.certificates}
` : ''}

${data.achievements ? `
ACHIEVEMENTS
============
Badges Earned: ${data.achievements.badgesEarned}/${data.achievements.totalBadges}
Rare Badges: ${data.achievements.rarebadges}
Recent: ${data.achievements.recentAchievements.join(', ')}
` : ''}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`; // Simplified as .txt for demo
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSVReport = (data: any, filename: string) => {
    let csvContent = 'Category,Metric,Value\n';
    
    if (data.steps) {
      csvContent += `Steps,Total Steps,${data.steps.totalSteps}\n`;
      csvContent += `Steps,Daily Average,${data.steps.averageDaily}\n`;
      csvContent += `Steps,Goal Achievement,${data.steps.goalAchievement}%\n`;
      csvContent += `Steps,Longest Streak,${data.steps.longestStreak}\n`;
    }
    
    if (data.nutrition) {
      csvContent += `Nutrition,Average Calories,${data.nutrition.averageCalories}\n`;
      csvContent += `Nutrition,Water Intake,${data.nutrition.waterIntake}%\n`;
      csvContent += `Nutrition,Meals Logged,${data.nutrition.mealsLogged}\n`;
    }

    if (data.training) {
      csvContent += `Training,Modules Completed,${data.training.modulesCompleted}\n`;
      csvContent += `Training,Time Spent,${data.training.timeSpent}\n`;
      csvContent += `Training,Certificates,${data.training.certificates}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExcelReport = (data: any, filename: string) => {
    // For demo purposes, we'll generate a CSV-like format
    // In a real implementation, you'd use a library like xlsx
    downloadCSVReport(data, filename);
  };

  const handleCustomExport = async () => {
    setIsExporting(true);
    
    try {
      const data = generateReportData('personal');
      const filename = `wellness-custom-report-${new Date().toISOString().split('T')[0]}`;
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      if (exportOptions.format === 'pdf') {
        downloadPDFReport(data, filename);
      } else if (exportOptions.format === 'csv') {
        downloadCSVReport(data, filename);
      } else {
        downloadExcelReport(data, filename);
      }
      
    } catch (error) {
      console.error('Custom export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Export Reports</h3>
          <span className="text-xl">📊</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleQuickExport('personal')}
            disabled={isExporting}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Quick Export'}
          </button>
          
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded text-xs font-medium"
          >
            Custom Export
          </button>
        </div>

        {showOptions && (
          <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-2">
            <div>
              <label className="block text-gray-600 mb-1">Format:</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as 'pdf' | 'csv' | 'excel'})}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            
            <button
              onClick={handleCustomExport}
              disabled={isExporting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Export Reports</h3>
        <span className="text-2xl">📊</span>
      </div>

      {/* Quick Export Options */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Quick Export</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickExport('personal')}
            disabled={isExporting}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <div>
                <h5 className="font-medium text-gray-900">Personal Report</h5>
                <p className="text-sm text-gray-600">Your wellness data and progress</p>
              </div>
            </div>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleQuickExport('group')}
              disabled={isExporting}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h5 className="font-medium text-gray-900">Group Report</h5>
                  <p className="text-sm text-gray-600">Team analytics and insights</p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => handleQuickExport('full')}
            disabled={isExporting}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📈</span>
              <div>
                <h5 className="font-medium text-gray-900">Complete Report</h5>
                <p className="text-sm text-gray-600">All available data</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Custom Export Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Custom Export</h4>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {showOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {showOptions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['week', 'month', 'quarter', 'year', 'custom'].map(range => (
                  <button
                    key={range}
                    onClick={() => setExportOptions({...exportOptions, dateRange: range as any})}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
                      exportOptions.dateRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportOptions.startDate || ''}
                    onChange={(e) => setExportOptions({...exportOptions, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportOptions.endDate || ''}
                    onChange={(e) => setExportOptions({...exportOptions, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Data Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'includeSteps', label: 'Step Tracking', icon: '👟' },
                  { key: 'includeNutrition', label: 'Nutrition', icon: '🥗' },
                  { key: 'includeTraining', label: 'Training', icon: '🎓' },
                  { key: 'includeStreaks', label: 'Streaks', icon: '🔥' },
                  { key: 'includeAchievements', label: 'Achievements', icon: '🏆' }
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exportOptions[item.key as keyof ExportOptions] as boolean}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        [item.key]: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.icon}</span>
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'pdf', label: 'PDF', icon: '📄' },
                  { value: 'csv', label: 'CSV', icon: '📊' },
                  { value: 'excel', label: 'Excel', icon: '📈' }
                ].map(format => (
                  <button
                    key={format.value}
                    onClick={() => setExportOptions({...exportOptions, format: format.value as any})}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded transition-colors ${
                      exportOptions.format === format.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{format.icon}</span>
                    <span>{format.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleCustomExport}
                disabled={isExporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Report...</span>
                  </div>
                ) : (
                  `Export ${exportOptions.format.toUpperCase()} Report`
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export History */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Recent Exports</h4>
        <div className="space-y-2">
          {[
            { name: 'Monthly Report - November 2024', date: '2024-11-15', format: 'PDF' },
            { name: 'Personal Progress - Week 45', date: '2024-11-08', format: 'CSV' },
            { name: 'Group Analytics - Q4 2024', date: '2024-11-01', format: 'Excel' }
          ].map((export_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">{export_.name}</p>
                <p className="text-gray-500 text-xs">{export_.date} • {export_.format}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportReportsWidget;