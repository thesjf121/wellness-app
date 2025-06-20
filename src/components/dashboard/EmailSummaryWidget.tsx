import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';

interface EmailSchedule {
  id: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  enabled: boolean;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  lastSent?: Date;
  nextSend?: Date;
}

interface EmailTemplate {
  type: 'weekly' | 'monthly' | 'quarterly';
  subject: string;
  includeSteps: boolean;
  includeNutrition: boolean;
  includeTraining: boolean;
  includeAchievements: boolean;
  includeGroupActivity: boolean;
  includeMotivationalMessage: boolean;
}

interface EmailSummaryWidgetProps {
  compact?: boolean;
  isAdmin?: boolean;
}

const EmailSummaryWidget: React.FC<EmailSummaryWidgetProps> = ({ 
  compact = false, 
  isAdmin = false 
}) => {
  const { user } = useMockAuth();
  const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = () => {
    // Load from localStorage or set defaults
    const savedSchedules = localStorage.getItem('email_schedules');
    const savedTemplates = localStorage.getItem('email_templates');

    const defaultSchedules: EmailSchedule[] = [
      {
        id: 'weekly',
        type: 'weekly',
        enabled: true,
        dayOfWeek: 1, // Monday
        time: '09:00',
        lastSent: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        nextSend: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4) // 4 days from now
      },
      {
        id: 'monthly',
        type: 'monthly',
        enabled: false,
        dayOfMonth: 1,
        time: '08:00',
        nextSend: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) // 15 days from now
      },
      {
        id: 'quarterly',
        type: 'quarterly',
        enabled: false,
        dayOfMonth: 1,
        time: '08:00',
        nextSend: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days from now
      }
    ];

    const defaultTemplates: EmailTemplate[] = [
      {
        type: 'weekly',
        subject: 'Your Weekly Wellness Summary 📊',
        includeSteps: true,
        includeNutrition: true,
        includeTraining: true,
        includeAchievements: true,
        includeGroupActivity: true,
        includeMotivationalMessage: true
      },
      {
        type: 'monthly',
        subject: 'Monthly Progress Report 🎯',
        includeSteps: true,
        includeNutrition: true,
        includeTraining: true,
        includeAchievements: true,
        includeGroupActivity: true,
        includeMotivationalMessage: true
      },
      {
        type: 'quarterly',
        subject: 'Quarterly Wellness Review 🏆',
        includeSteps: true,
        includeNutrition: true,
        includeTraining: true,
        includeAchievements: true,
        includeGroupActivity: true,
        includeMotivationalMessage: true
      }
    ];

    setSchedules(savedSchedules ? JSON.parse(savedSchedules) : defaultSchedules);
    setTemplates(savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates);
  };

  const saveSettings = () => {
    localStorage.setItem('email_schedules', JSON.stringify(schedules));
    localStorage.setItem('email_templates', JSON.stringify(templates));
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const updateTemplate = (type: 'weekly' | 'monthly' | 'quarterly', updates: Partial<EmailTemplate>) => {
    setTemplates(prev =>
      prev.map(template =>
        template.type === type
          ? { ...template, ...updates }
          : template
      )
    );
  };

  const sendTestEmail = async () => {
    // Simulate sending test email
    const template = templates.find(t => t.type === selectedTemplate);
    if (!template) return;

    try {
      // Generate test email content
      const emailContent = generateEmailContent(selectedTemplate, template);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, just show success message
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
      
      console.log('Test email sent:', emailContent);
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email. Please try again.');
    }
  };

  const generateEmailContent = (type: 'weekly' | 'monthly' | 'quarterly', template: EmailTemplate) => {
    const period = type === 'weekly' ? 'week' : type === 'monthly' ? 'month' : 'quarter';
    
    let content = `
Subject: ${template.subject}

Hello ${user?.firstName || 'User'},

Here's your ${period}ly wellness summary:

`;

    if (template.includeSteps) {
      const totalSteps = Math.floor(Math.random() * 50000) + 30000;
      const dailyAvg = Math.floor(totalSteps / (type === 'weekly' ? 7 : type === 'monthly' ? 30 : 90));
      content += `
🚶 STEP TRACKING
Total Steps: ${totalSteps.toLocaleString()}
Daily Average: ${dailyAvg.toLocaleString()}
Goal Achievement: ${Math.floor(Math.random() * 40) + 60}%

`;
    }

    if (template.includeNutrition) {
      content += `
🥗 NUTRITION
Meals Logged: ${Math.floor(Math.random() * 20) + 15}
Average Calories: ${Math.floor(Math.random() * 300) + 1800}
Water Intake: ${Math.floor(Math.random() * 20) + 70}% of goal

`;
    }

    if (template.includeTraining) {
      content += `
🎓 TRAINING PROGRESS
Modules Completed: ${Math.floor(Math.random() * 3) + 1}
Total Time: ${Math.floor(Math.random() * 120) + 60} minutes
Certificates Earned: ${Math.floor(Math.random() * 2) + 1}

`;
    }

    if (template.includeAchievements) {
      content += `
🏆 ACHIEVEMENTS
New Badges: ${Math.floor(Math.random() * 3) + 1}
Current Streak: ${Math.floor(Math.random() * 15) + 5} days
Recent Achievement: "Step Warrior"

`;
    }

    if (template.includeGroupActivity && type !== 'quarterly') {
      content += `
👥 GROUP ACTIVITY
Team Ranking: #${Math.floor(Math.random() * 5) + 1}
Group Goal: ${Math.floor(Math.random() * 30) + 70}% achieved
Most Active Member: Sarah Johnson

`;
    }

    if (template.includeMotivationalMessage) {
      const messages = [
        "Keep up the fantastic work! Your consistency is paying off.",
        "You're making great progress toward your wellness goals.",
        "Your dedication to health and wellness is inspiring!",
        "Every step counts - you're building lasting healthy habits.",
        "Great job staying committed to your wellness journey!"
      ];
      content += `
💪 MOTIVATION
${messages[Math.floor(Math.random() * messages.length)]}

`;
    }

    content += `
Keep up the great work!

The WellnessApp Team
`;

    return content;
  };

  const formatNextSend = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'soon';
    }
  };

  useEffect(() => {
    saveSettings();
  }, [schedules, templates]);

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Email Summaries</h3>
          <span className="text-xl">📧</span>
        </div>

        <div className="space-y-2">
          {schedules.filter(s => s.enabled).map(schedule => (
            <div key={schedule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-xs font-medium text-gray-900 capitalize">{schedule.type}</p>
                <p className="text-xs text-gray-500">
                  Next: {schedule.nextSend ? formatNextSend(schedule.nextSend) : 'Not scheduled'}
                </p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
          
          {schedules.filter(s => s.enabled).length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">No active schedules</p>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full mt-3 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100"
        >
          Manage Settings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Email Summaries</h3>
        <span className="text-2xl">📧</span>
      </div>

      {/* Schedule Overview */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Active Schedules</h4>
        <div className="space-y-3">
          {schedules.map(schedule => (
            <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${schedule.enabled ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <div>
                  <h5 className="font-medium text-gray-900 capitalize">{schedule.type} Summary</h5>
                  <p className="text-sm text-gray-600">
                    {schedule.enabled ? (
                      <>
                        Next: {schedule.nextSend ? formatNextSend(schedule.nextSend) : 'Not scheduled'} 
                        {schedule.lastSent && (
                          <span className="ml-2">• Last sent: {schedule.lastSent.toLocaleDateString()}</span>
                        )}
                      </>
                    ) : (
                      'Disabled'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSchedule(schedule.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  schedule.enabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {schedule.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Email Settings</h4>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edit Template</label>
              <div className="flex space-x-2">
                {templates.map(template => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template.type)}
                    className={`px-3 py-2 text-sm rounded transition-colors capitalize ${
                      selectedTemplate === template.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {template.type}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Configuration */}
            {(() => {
              const template = templates.find(t => t.type === selectedTemplate);
              if (!template) return null;

              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => updateTemplate(selectedTemplate, { subject: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Email subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Include in Email</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'includeSteps', label: 'Step Tracking', icon: '👟' },
                        { key: 'includeNutrition', label: 'Nutrition Data', icon: '🥗' },
                        { key: 'includeTraining', label: 'Training Progress', icon: '🎓' },
                        { key: 'includeAchievements', label: 'Achievements', icon: '🏆' },
                        { key: 'includeGroupActivity', label: 'Group Activity', icon: '👥' },
                        { key: 'includeMotivationalMessage', label: 'Motivation', icon: '💪' }
                      ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={template[item.key as keyof EmailTemplate] as boolean}
                            onChange={(e) => updateTemplate(selectedTemplate, {
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
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Test Email */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Test Email</h4>
        <p className="text-sm text-gray-600 mb-3">
          Send a test email to see how your summary will look.
        </p>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="weekly">Weekly Summary</option>
            <option value="monthly">Monthly Report</option>
            <option value="quarterly">Quarterly Review</option>
          </select>
          <button
            onClick={sendTestEmail}
            disabled={testEmailSent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testEmailSent ? '✓ Sent!' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* Recent Emails */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Emails</h4>
        <div className="space-y-2">
          {[
            { type: 'Weekly Summary', date: '2024-11-18', status: 'Delivered' },
            { type: 'Monthly Report', date: '2024-11-01', status: 'Delivered' },
            { type: 'Weekly Summary', date: '2024-11-11', status: 'Delivered' },
            { type: 'Weekly Summary', date: '2024-11-04', status: 'Delivered' }
          ].map((email, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">{email.type}</p>
                <p className="text-gray-500 text-xs">{email.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 text-xs">✓ {email.status}</span>
                <button className="text-blue-600 hover:text-blue-700 text-xs">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Admin Controls</h4>
          <div className="flex space-x-3">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Manage All Users
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Email Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSummaryWidget;