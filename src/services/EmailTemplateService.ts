import { WellnessNotification } from './notificationService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'achievement' | 'reminder' | 'summary' | 'welcome' | 're_engagement' | 'weekly_digest';
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  templateId: string;
  variables: Record<string, any>;
}

class EmailTemplateService {
  private templates: EmailTemplate[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    this.templates = [
      // Achievement Email Template
      {
        id: 'achievement_unlocked',
        name: 'Achievement Unlocked',
        subject: '🎉 You just unlocked: {{achievementName}}!',
        type: 'achievement',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Achievement Unlocked!</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
              .badge { font-size: 4em; margin-bottom: 10px; }
              .achievement-title { font-size: 24px; font-weight: bold; margin: 10px 0; }
              .achievement-description { opacity: 0.9; margin-bottom: 20px; }
              .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
              .stat-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
              .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="badge">{{achievementIcon}}</div>
                <h1>Achievement Unlocked!</h1>
                <div class="achievement-title">{{achievementName}}</div>
                <div class="achievement-description">{{achievementDescription}}</div>
              </div>
              
              <p>Hi {{userName}},</p>
              
              <p>Congratulations! You've just earned a new achievement. Your dedication to wellness is truly inspiring!</p>
              
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-number">{{totalBadges}}</div>
                  <div class="stat-label">Total Badges</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">{{currentStreak}}</div>
                  <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">{{completionRate}}%</div>
                  <div class="stat-label">Goal Rate</div>
                </div>
              </div>
              
              <p>Keep up the fantastic work! Every step you take brings you closer to your wellness goals.</p>
              
              <div style="text-align: center;">
                <a href="{{appUrl}}/achievements" class="cta-button">View All Achievements</a>
              </div>
              
              <div class="footer">
                <p>Keep thriving!</p>
                <p><strong>The WellnessApp Team</strong></p>
                <p>If you no longer wish to receive these emails, <a href="{{unsubscribeUrl}}">unsubscribe here</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
🎉 Achievement Unlocked: {{achievementName}}!

Hi {{userName}},

Congratulations! You've just earned a new achievement: {{achievementName}}

{{achievementDescription}}

Your Stats:
- Total Badges: {{totalBadges}}
- Current Streak: {{currentStreak}} days
- Goal Completion Rate: {{completionRate}}%

Keep up the fantastic work! Every step you take brings you closer to your wellness goals.

View all your achievements: {{appUrl}}/achievements

Keep thriving!
The WellnessApp Team

Unsubscribe: {{unsubscribeUrl}}
        `,
        variables: ['userName', 'achievementName', 'achievementDescription', 'achievementIcon', 'totalBadges', 'currentStreak', 'completionRate', 'appUrl', 'unsubscribeUrl'],
        isActive: true
      },

      // Daily Reminder Template
      {
        id: 'daily_reminder',
        name: 'Daily Wellness Reminder',
        subject: '🌅 Start your wellness journey today, {{userName}}!',
        type: 'reminder',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Wellness Reminder</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
              .goals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
              .goal-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #74b9ff; }
              .goal-title { font-weight: bold; color: #333; margin-bottom: 5px; }
              .goal-progress { background: #e9ecef; height: 6px; border-radius: 3px; margin: 8px 0; }
              .goal-progress-bar { background: #74b9ff; height: 100%; border-radius: 3px; transition: width 0.3s ease; }
              .tip-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
              .cta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 20px 0; }
              .cta-button { display: block; background: #74b9ff; color: white; padding: 12px; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌅 Good {{timeOfDay}}, {{userName}}!</h1>
                <p>Ready to make today amazing?</p>
              </div>
              
              <p>Here's your wellness snapshot for today:</p>
              
              <div class="goals-grid">
                <div class="goal-card">
                  <div class="goal-title">👟 Steps Goal</div>
                  <div>{{currentSteps}} / {{stepGoal}} steps</div>
                  <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: {{stepProgress}}%"></div>
                  </div>
                </div>
                <div class="goal-card">
                  <div class="goal-title">🥗 Meals Logged</div>
                  <div>{{mealsLogged}} / 3 meals</div>
                  <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: {{mealProgress}}%"></div>
                  </div>
                </div>
              </div>
              
              <div class="tip-box">
                <strong>💡 Today's Wellness Tip:</strong><br>
                {{dailyTip}}
              </div>
              
              <div class="cta-grid">
                <a href="{{appUrl}}/step-counter" class="cta-button">Track Steps</a>
                <a href="{{appUrl}}/food-journal" class="cta-button">Log Food</a>
                <a href="{{appUrl}}/training" class="cta-button">Learn</a>
              </div>
              
              <p>Remember: Every small step counts towards your bigger wellness goals. You've got this! 💪</p>
              
              <div class="footer">
                <p>Stay healthy!</p>
                <p><strong>The WellnessApp Team</strong></p>
                <p>Adjust your reminder preferences <a href="{{preferencesUrl}}">here</a> | <a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
🌅 Good {{timeOfDay}}, {{userName}}!

Ready to make today amazing?

Your wellness snapshot for today:

👟 Steps: {{currentSteps}} / {{stepGoal}}
🥗 Meals logged: {{mealsLogged}} / 3

💡 Today's Wellness Tip:
{{dailyTip}}

Quick Actions:
- Track Steps: {{appUrl}}/step-counter  
- Log Food: {{appUrl}}/food-journal
- Continue Learning: {{appUrl}}/training

Remember: Every small step counts towards your bigger wellness goals. You've got this! 💪

Stay healthy!
The WellnessApp Team

Preferences: {{preferencesUrl}} | Unsubscribe: {{unsubscribeUrl}}
        `,
        variables: ['userName', 'timeOfDay', 'currentSteps', 'stepGoal', 'stepProgress', 'mealsLogged', 'mealProgress', 'dailyTip', 'appUrl', 'preferencesUrl', 'unsubscribeUrl'],
        isActive: true
      },

      // Weekly Summary Template
      {
        id: 'weekly_summary',
        name: 'Weekly Progress Summary',
        subject: '📊 Your amazing week in wellness, {{userName}}!',
        type: 'summary',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Summary</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; background: linear-gradient(135deg, #6c5ce7 0%, #fd79a8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
              .week-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 20px 0; }
              .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-number { font-size: 28px; font-weight: bold; color: #6c5ce7; }
              .stat-label { font-size: 12px; color: #666; text-transform: uppercase; margin-top: 5px; }
              .achievements-list { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .achievement-item { display: flex; align-items: center; margin: 8px 0; }
              .achievement-icon { font-size: 24px; margin-right: 10px; }
              .day-breakdown { margin: 20px 0; }
              .day-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
              .day-name { font-weight: bold; }
              .day-status { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
              .goal-met { background: #d4edda; color: #155724; }
              .goal-partial { background: #fff3cd; color: #856404; }
              .goal-missed { background: #f8d7da; color: #721c24; }
              .cta-button { display: inline-block; background: #6c5ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Your Week in Review</h1>
                <p>{{weekRange}}</p>
              </div>
              
              <p>Hi {{userName}},</p>
              
              <p>What an incredible week! Here's a summary of your wellness journey:</p>
              
              <div class="week-stats">
                <div class="stat-card">
                  <div class="stat-number">{{totalSteps}}</div>
                  <div class="stat-label">Total Steps</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{avgSteps}}</div>
                  <div class="stat-label">Daily Average</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{goalsReached}}/7</div>
                  <div class="stat-label">Goals Met</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{currentStreak}}</div>
                  <div class="stat-label">Day Streak</div>
                </div>
              </div>
              
              {{#if hasAchievements}}
              <div class="achievements-list">
                <h3>🏆 This Week's Achievements</h3>
                {{#each achievements}}
                <div class="achievement-item">
                  <span class="achievement-icon">{{icon}}</span>
                  <span>{{name}} - {{description}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
              
              <div class="day-breakdown">
                <h3>📅 Daily Breakdown</h3>
                {{#each dailyData}}
                <div class="day-item">
                  <span class="day-name">{{day}}</span>
                  <span class="day-status {{statusClass}}">{{steps}} steps</span>
                </div>
                {{/each}}
              </div>
              
              <p><strong>{{motivationalMessage}}</strong></p>
              
              <div style="text-align: center;">
                <a href="{{appUrl}}/dashboard" class="cta-button">View Full Dashboard</a>
              </div>
              
              <div class="footer">
                <p>Keep up the amazing work!</p>
                <p><strong>The WellnessApp Team</strong></p>
                <p><a href="{{preferencesUrl}}">Email Preferences</a> | <a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
📊 Your Week in Review - {{weekRange}}

Hi {{userName}},

What an incredible week! Here's your wellness summary:

📈 WEEKLY STATS
• Total Steps: {{totalSteps}}
• Daily Average: {{avgSteps}}
• Goals Met: {{goalsReached}}/7
• Current Streak: {{currentStreak}} days

🏆 THIS WEEK'S ACHIEVEMENTS
{{#each achievements}}
• {{icon}} {{name}} - {{description}}
{{/each}}

📅 DAILY BREAKDOWN
{{#each dailyData}}
{{day}}: {{steps}} steps
{{/each}}

{{motivationalMessage}}

View your full dashboard: {{appUrl}}/dashboard

Keep up the amazing work!
The WellnessApp Team

Preferences: {{preferencesUrl}} | Unsubscribe: {{unsubscribeUrl}}
        `,
        variables: ['userName', 'weekRange', 'totalSteps', 'avgSteps', 'goalsReached', 'currentStreak', 'hasAchievements', 'achievements', 'dailyData', 'motivationalMessage', 'appUrl', 'preferencesUrl', 'unsubscribeUrl'],
        isActive: true
      },

      // Re-engagement Template
      {
        id: 're_engagement',
        name: 'Come Back - We Miss You',
        subject: '👋 {{userName}}, your wellness journey is waiting!',
        type: 're_engagement',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>We Miss You!</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
              .miss-you-icon { font-size: 4em; margin-bottom: 10px; }
              .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
              .feature-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .feature-icon { font-size: 2em; margin-bottom: 10px; }
              .feature-title { font-weight: bold; margin-bottom: 5px; }
              .comeback-incentive { background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #17a2b8; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; font-size: 16px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="miss-you-icon">👋</div>
                <h1>We miss you, {{userName}}!</h1>
                <p>Your wellness journey is waiting for you</p>
              </div>
              
              <p>It's been {{daysSinceLastActive}} days since your last visit, and we wanted to reach out because your health and wellness matter to us.</p>
              
              <div class="comeback-incentive">
                <h3>🎁 Welcome Back Bonus!</h3>
                <p>Come back today and get a <strong>7-day streak head start</strong> plus unlock exclusive wellness content!</p>
              </div>
              
              <p>Here's what's new and waiting for you:</p>
              
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-icon">🏆</div>
                  <div class="feature-title">New Achievements</div>
                  <div>Unlock badges you haven't seen before</div>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">🎓</div>
                  <div class="feature-title">Updated Training</div>
                  <div>Fresh wellness coaching content</div>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">👥</div>
                  <div class="feature-title">Community Growth</div>
                  <div>Join thousands on their wellness journey</div>
                </div>
              </div>
              
              <p>Remember your goals:</p>
              <ul>
                <li>🏃‍♂️ Daily step goal: {{lastStepGoal}} steps</li>
                <li>🥗 Nutrition tracking with AI insights</li>
                <li>🎯 Building lasting healthy habits</li>
              </ul>
              
              <p>You were doing so well! Your highest streak was <strong>{{bestStreak}} days</strong> - let's beat that record together.</p>
              
              <div style="text-align: center;">
                <a href="{{appUrl}}/dashboard?comeback=true" class="cta-button">Continue My Journey</a>
              </div>
              
              <p><em>Small steps lead to big changes. We believe in you! 💪</em></p>
              
              <div class="footer">
                <p>Ready when you are!</p>
                <p><strong>The WellnessApp Team</strong></p>
                <p>If you're no longer interested in your wellness journey, <a href="{{unsubscribeUrl}}">unsubscribe here</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
👋 We miss you, {{userName}}!

It's been {{daysSinceLastActive}} days since your last visit, and we wanted to reach out because your health and wellness matter to us.

🎁 Welcome Back Bonus!
Come back today and get a 7-day streak head start plus unlock exclusive wellness content!

What's new and waiting for you:
🏆 New achievements to unlock
🎓 Updated wellness training content  
👥 Growing community of wellness enthusiasts

Remember your goals:
• Daily step goal: {{lastStepGoal}} steps
• Nutrition tracking with AI insights
• Building lasting healthy habits

You were doing so well! Your highest streak was {{bestStreak}} days - let's beat that record together.

Continue your journey: {{appUrl}}/dashboard?comeback=true

Small steps lead to big changes. We believe in you! 💪

Ready when you are!
The WellnessApp Team

Unsubscribe: {{unsubscribeUrl}}
        `,
        variables: ['userName', 'daysSinceLastActive', 'lastStepGoal', 'bestStreak', 'appUrl', 'unsubscribeUrl'],
        isActive: true
      }
    ];
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  getAllTemplates(): EmailTemplate[] {
    return [...this.templates];
  }

  getActiveTemplates(): EmailTemplate[] {
    return this.templates.filter(template => template.isActive);
  }

  getTemplatesByType(type: EmailTemplate['type']): EmailTemplate[] {
    return this.templates.filter(template => template.type === type && template.isActive);
  }

  generateEmailData(templateId: string, variables: Record<string, any>, recipient: string): EmailData | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template with id ${templateId} not found`);
      return null;
    }

    // Replace variables in content
    const htmlContent = this.replaceVariables(template.htmlContent, variables);
    const textContent = this.replaceVariables(template.textContent, variables);
    const subject = this.replaceVariables(template.subject, variables);

    return {
      to: recipient,
      from: 'WellnessApp <noreply@wellnessapp.com>',
      subject,
      htmlContent,
      textContent,
      templateId,
      variables
    };
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    
    // Replace simple variables {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#if condition}}...{{/if}}
    result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    // Handle loops {{#each array}}...{{/each}}
    result = result.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, template) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemContent = template;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemContent = itemContent.replace(regex, String(value || ''));
        });
        return itemContent;
      }).join('');
    });

    return result;
  }

  // Generate email data for different notification types
  generateAchievementEmail(recipient: string, achievementData: any): EmailData | null {
    const variables = {
      userName: achievementData.userName || 'Wellness Champion',
      achievementName: achievementData.achievementName,
      achievementDescription: achievementData.achievementDescription,
      achievementIcon: achievementData.achievementIcon || '🏆',
      totalBadges: achievementData.totalBadges || 0,
      currentStreak: achievementData.currentStreak || 0,
      completionRate: achievementData.completionRate || 0,
      appUrl: 'https://wellnessapp.com',
      unsubscribeUrl: `https://wellnessapp.com/unsubscribe?email=${recipient}`
    };

    return this.generateEmailData('achievement_unlocked', variables, recipient);
  }

  generateDailyReminderEmail(recipient: string, userData: any): EmailData | null {
    const timeOfDay = this.getTimeOfDay();
    const dailyTips = [
      'Take a 5-minute walk every hour to boost energy and focus',
      'Drink a glass of water before each meal to stay hydrated',
      'Take 3 deep breaths when you feel stressed',
      'Stretch for 2 minutes when you wake up',
      'End your day by writing down one thing you\'re grateful for'
    ];

    const variables = {
      userName: userData.userName || 'Wellness Champion',
      timeOfDay,
      currentSteps: userData.currentSteps || 0,
      stepGoal: userData.stepGoal || 8000,
      stepProgress: Math.min(100, ((userData.currentSteps || 0) / (userData.stepGoal || 8000)) * 100),
      mealsLogged: userData.mealsLogged || 0,
      mealProgress: Math.min(100, ((userData.mealsLogged || 0) / 3) * 100),
      dailyTip: dailyTips[Math.floor(Math.random() * dailyTips.length)],
      appUrl: 'https://wellnessapp.com',
      preferencesUrl: `https://wellnessapp.com/preferences?email=${recipient}`,
      unsubscribeUrl: `https://wellnessapp.com/unsubscribe?email=${recipient}`
    };

    return this.generateEmailData('daily_reminder', variables, recipient);
  }

  generateWeeklySummaryEmail(recipient: string, weeklyData: any): EmailData | null {
    const motivationalMessages = [
      'Your consistency is building lasting healthy habits!',
      'Every step forward is progress worth celebrating!',
      'You\'re inspiring others with your dedication!',
      'Small daily improvements lead to stunning yearly results!',
      'Your commitment to wellness is truly admirable!'
    ];

    const variables = {
      userName: weeklyData.userName || 'Wellness Champion',
      weekRange: weeklyData.weekRange,
      totalSteps: (weeklyData.totalSteps || 0).toLocaleString(),
      avgSteps: Math.round(weeklyData.avgSteps || 0).toLocaleString(),
      goalsReached: weeklyData.goalsReached || 0,
      currentStreak: weeklyData.currentStreak || 0,
      hasAchievements: weeklyData.achievements && weeklyData.achievements.length > 0,
      achievements: weeklyData.achievements || [],
      dailyData: weeklyData.dailyData || [],
      motivationalMessage: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
      appUrl: 'https://wellnessapp.com',
      preferencesUrl: `https://wellnessapp.com/preferences?email=${recipient}`,
      unsubscribeUrl: `https://wellnessapp.com/unsubscribe?email=${recipient}`
    };

    return this.generateEmailData('weekly_summary', variables, recipient);
  }

  generateReEngagementEmail(recipient: string, userInactivityData: any): EmailData | null {
    const variables = {
      userName: userInactivityData.userName || 'Wellness Champion',
      daysSinceLastActive: userInactivityData.daysSinceLastActive || 7,
      lastStepGoal: userInactivityData.lastStepGoal || 8000,
      bestStreak: userInactivityData.bestStreak || 5,
      appUrl: 'https://wellnessapp.com',
      unsubscribeUrl: `https://wellnessapp.com/unsubscribe?email=${recipient}`
    };

    return this.generateEmailData('re_engagement', variables, recipient);
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // Mock email sending (in production, this would integrate with an email service)
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        templateId: emailData.templateId
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, integrate with services like:
      // - SendGrid
      // - Mailgun  
      // - AWS SES
      // - Postmark
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendNotificationEmail(notification: WellnessNotification, recipient: string, userData: any): Promise<boolean> {
    let emailData: EmailData | null = null;

    switch (notification.type) {
      case 'achievement':
        emailData = this.generateAchievementEmail(recipient, {
          userName: userData.userName,
          achievementName: notification.title.replace('🎉 Achievement Unlocked!', '').trim(),
          achievementDescription: notification.body,
          achievementIcon: notification.icon,
          ...userData
        });
        break;

      case 'reminder':
        emailData = this.generateDailyReminderEmail(recipient, userData);
        break;

      case 'weekly_summary':
        emailData = this.generateWeeklySummaryEmail(recipient, userData);
        break;

      case 're_engagement':
        emailData = this.generateReEngagementEmail(recipient, userData);
        break;

      default:
        console.log(`No email template for notification type: ${notification.type}`);
        return false;
    }

    if (emailData) {
      return await this.sendEmail(emailData);
    }

    return false;
  }
}

export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;