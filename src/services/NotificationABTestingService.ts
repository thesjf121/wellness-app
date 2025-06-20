import { WellnessNotification } from './notificationService';
import { smartNotificationScheduler } from './SmartNotificationScheduler';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100, percentage of users who get this variant
  notificationTemplate: Partial<WellnessNotification>;
  isControl: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    userSegments?: string[];
    minEngagementScore?: number;
    maxEngagementScore?: number;
    timeZones?: string[];
    deviceTypes?: ('mobile' | 'desktop' | 'tablet')[];
  };
  variants: ABTestVariant[];
  metrics: {
    primary: 'open_rate' | 'click_rate' | 'conversion_rate' | 'engagement_score';
    secondary?: ('open_rate' | 'click_rate' | 'conversion_rate' | 'engagement_score')[];
  };
  minimumSampleSize: number;
  confidenceLevel: number; // 90, 95, 99
  createdBy: string;
  createdAt: Date;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  notificationId: string;
  sentAt: Date;
  opened: boolean;
  openedAt?: Date;
  clicked: boolean;
  clickedAt?: Date;
  converted: boolean; // Based on specific goal (e.g., logged food, completed training)
  convertedAt?: Date;
  responseTime?: number; // Minutes
}

export interface ABTestAnalytics {
  testId: string;
  isComplete: boolean;
  hasStatisticalSignificance: boolean;
  confidenceLevel: number;
  sampleSize: number;
  variants: Array<{
    id: string;
    name: string;
    isControl: boolean;
    participantCount: number;
    metrics: {
      sentCount: number;
      openCount: number;
      clickCount: number;
      conversionCount: number;
      openRate: number;
      clickRate: number;
      conversionRate: number;
      avgResponseTime: number;
      engagementScore: number;
    };
    confidenceInterval?: {
      lower: number;
      upper: number;
      metric: string;
    };
  }>;
  winner?: {
    variantId: string;
    improvement: number;
    metric: string;
  };
  recommendations: string[];
}

class NotificationABTestingService {
  private tests: ABTest[] = [];
  private results: ABTestResult[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadStoredData();
      this.startTestingEngine();
      this.isInitialized = true;
      console.log('NotificationABTestingService initialized');
    } catch (error) {
      console.error('Error initializing NotificationABTestingService:', error);
    }
  }

  private async loadStoredData(): Promise<void> {
    try {
      // Load tests
      const storedTests = localStorage.getItem('ab_tests');
      if (storedTests) {
        this.tests = JSON.parse(storedTests).map((test: any) => ({
          ...test,
          startDate: new Date(test.startDate),
          endDate: test.endDate ? new Date(test.endDate) : undefined,
          createdAt: new Date(test.createdAt)
        }));
      }

      // Load results
      const storedResults = localStorage.getItem('ab_test_results');
      if (storedResults) {
        this.results = JSON.parse(storedResults).map((result: any) => ({
          ...result,
          sentAt: new Date(result.sentAt),
          openedAt: result.openedAt ? new Date(result.openedAt) : undefined,
          clickedAt: result.clickedAt ? new Date(result.clickedAt) : undefined,
          convertedAt: result.convertedAt ? new Date(result.convertedAt) : undefined
        }));
      }

      // Initialize with sample tests if none exist
      if (this.tests.length === 0) {
        this.createSampleTests();
      }
    } catch (error) {
      console.error('Error loading AB test data:', error);
    }
  }

  private createSampleTests(): void {
    // Sample Achievement Notification Test
    const achievementTest: ABTest = {
      id: 'achievement_copy_test_1',
      name: 'Achievement Notification Copy Test',
      description: 'Testing different ways to celebrate user achievements',
      status: 'running',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      targetAudience: {
        minEngagementScore: 0.3,
        deviceTypes: ['mobile', 'desktop']
      },
      variants: [
        {
          id: 'control',
          name: 'Control - Standard Copy',
          weight: 50,
          isControl: true,
          notificationTemplate: {
            title: '🎉 Achievement Unlocked!',
            body: 'You earned a new badge!',
            icon: '🏆'
          }
        },
        {
          id: 'personalized',
          name: 'Personalized Copy',
          weight: 50,
          isControl: false,
          notificationTemplate: {
            title: '🌟 You\'re amazing!',
            body: 'Your dedication just earned you something special!',
            icon: '✨'
          }
        }
      ],
      metrics: {
        primary: 'open_rate',
        secondary: ['click_rate', 'engagement_score']
      },
      minimumSampleSize: 100,
      confidenceLevel: 95,
      createdBy: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
    };

    // Sample Reminder Timing Test
    const timingTest: ABTest = {
      id: 'reminder_timing_test_1',
      name: 'Meal Reminder Timing Test',
      description: 'Testing optimal timing for meal reminder notifications',
      status: 'running',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9), // 9 days from now
      targetAudience: {
        minEngagementScore: 0.2
      },
      variants: [
        {
          id: 'early_reminder',
          name: 'Early Reminder (30 min before)',
          weight: 33,
          isControl: true,
          notificationTemplate: {
            title: '🍽️ Meal time approaching!',
            body: 'Your meal time is in 30 minutes. Don\'t forget to plan!',
            icon: '⏰'
          }
        },
        {
          id: 'exact_time',
          name: 'Exact Time',
          weight: 33,
          isControl: false,
          notificationTemplate: {
            title: '🥗 Time to eat!',
            body: 'It\'s meal time! Log your food for AI analysis.',
            icon: '🍽️'
          }
        },
        {
          id: 'gentle_reminder',
          name: 'Gentle Follow-up (15 min after)',
          weight: 34,
          isControl: false,
          notificationTemplate: {
            title: '💭 Quick reminder',
            body: 'If you just ate, don\'t forget to log it!',
            icon: '📝'
          }
        }
      ],
      metrics: {
        primary: 'conversion_rate',
        secondary: ['open_rate', 'click_rate']
      },
      minimumSampleSize: 150,
      confidenceLevel: 95,
      createdBy: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)
    };

    this.tests = [achievementTest, timingTest];
    this.saveData();
  }

  private saveData(): void {
    try {
      localStorage.setItem('ab_tests', JSON.stringify(this.tests));
      localStorage.setItem('ab_test_results', JSON.stringify(this.results));
    } catch (error) {
      console.error('Error saving AB test data:', error);
    }
  }

  private startTestingEngine(): void {
    // Check test completion every hour
    setInterval(() => {
      this.checkTestCompletion();
    }, 3600000); // 1 hour

    // Clean up old data daily
    setInterval(() => {
      this.cleanupOldData();
    }, 86400000); // 24 hours
  }

  private checkTestCompletion(): void {
    const now = new Date();
    let hasUpdates = false;

    this.tests.forEach(test => {
      if (test.status === 'running') {
        const analytics = this.getTestAnalytics(test.id);
        
        // Check if test should be completed due to:
        // 1. End date reached
        // 2. Minimum sample size + statistical significance achieved
        if (test.endDate && now >= test.endDate) {
          test.status = 'completed';
          hasUpdates = true;
        } else if (analytics.sampleSize >= test.minimumSampleSize && analytics.hasStatisticalSignificance) {
          test.status = 'completed';
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      this.saveData();
    }
  }

  private cleanupOldData(): void {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Remove old results
    this.results = this.results.filter(result => result.sentAt > threeMonthsAgo);
    
    // Remove old completed tests
    this.tests = this.tests.filter(test => 
      test.status !== 'completed' || test.createdAt > threeMonthsAgo
    );

    this.saveData();
  }

  public createTest(testData: Omit<ABTest, 'id' | 'createdAt'>): string {
    const test: ABTest = {
      ...testData,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    // Validate test
    this.validateTest(test);

    this.tests.push(test);
    this.saveData();

    return test.id;
  }

  private validateTest(test: ABTest): void {
    // Validate variant weights sum to 100
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      throw new Error('Variant weights must sum to 100%');
    }

    // Ensure at least one control
    const hasControl = test.variants.some(variant => variant.isControl);
    if (!hasControl) {
      throw new Error('At least one variant must be marked as control');
    }

    // Validate date range
    if (test.endDate && test.endDate <= test.startDate) {
      throw new Error('End date must be after start date');
    }

    // Validate minimum sample size
    if (test.minimumSampleSize < 30) {
      throw new Error('Minimum sample size should be at least 30 for statistical validity');
    }
  }

  public getVariantForUser(testId: string, userId: string): ABTestVariant | null {
    const test = this.tests.find(t => t.id === testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user is in target audience
    if (!this.isUserInTargetAudience(userId, test.targetAudience)) {
      return null;
    }

    // Use consistent hash to assign variant
    const hash = this.hashUserId(userId + testId);
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (hash <= cumulative) {
        return variant;
      }
    }

    // Fallback to control
    return test.variants.find(v => v.isControl) || test.variants[0];
  }

  private isUserInTargetAudience(userId: string, audience: ABTest['targetAudience']): boolean {
    // For demo purposes, we'll simulate user data
    // In a real app, this would check actual user properties
    
    const mockUserData = {
      engagementScore: Math.random(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: this.getDeviceType(),
      segments: ['active_user', 'wellness_focused']
    };

    // Check engagement score
    if (audience.minEngagementScore && mockUserData.engagementScore < audience.minEngagementScore) {
      return false;
    }
    if (audience.maxEngagementScore && mockUserData.engagementScore > audience.maxEngagementScore) {
      return false;
    }

    // Check device type
    if (audience.deviceTypes && !audience.deviceTypes.includes(mockUserData.deviceType)) {
      return false;
    }

    // Check time zone
    if (audience.timeZones && !audience.timeZones.includes(mockUserData.timeZone)) {
      return false;
    }

    // Check user segments
    if (audience.userSegments) {
      const hasMatchingSegment = audience.userSegments.some(segment =>
        mockUserData.segments.includes(segment)
      );
      if (!hasMatchingSegment) {
        return false;
      }
    }

    return true;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobi|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  public recordTestResult(result: Omit<ABTestResult, 'sentAt'>): void {
    const testResult: ABTestResult = {
      ...result,
      sentAt: new Date()
    };

    this.results.push(testResult);
    this.saveData();
  }

  public updateTestResult(
    testId: string,
    notificationId: string,
    userId: string,
    update: {
      opened?: boolean;
      clicked?: boolean;
      converted?: boolean;
      responseTime?: number;
    }
  ): void {
    const result = this.results.find(
      r => r.testId === testId && r.notificationId === notificationId && r.userId === userId
    );

    if (result) {
      const now = new Date();
      
      if (update.opened !== undefined) {
        result.opened = update.opened;
        if (update.opened) result.openedAt = now;
      }
      
      if (update.clicked !== undefined) {
        result.clicked = update.clicked;
        if (update.clicked) result.clickedAt = now;
      }
      
      if (update.converted !== undefined) {
        result.converted = update.converted;
        if (update.converted) result.convertedAt = now;
      }
      
      if (update.responseTime !== undefined) {
        result.responseTime = update.responseTime;
      }

      this.saveData();
    }
  }

  public getTestAnalytics(testId: string): ABTestAnalytics {
    const test = this.tests.find(t => t.id === testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const testResults = this.results.filter(r => r.testId === testId);
    const sampleSize = testResults.length;

    const variantAnalytics = test.variants.map(variant => {
      const variantResults = testResults.filter(r => r.variantId === variant.id);
      const participantCount = variantResults.length;
      
      const sentCount = variantResults.length;
      const openCount = variantResults.filter(r => r.opened).length;
      const clickCount = variantResults.filter(r => r.clicked).length;
      const conversionCount = variantResults.filter(r => r.converted).length;
      
      const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
      const clickRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;
      const conversionRate = sentCount > 0 ? (conversionCount / sentCount) * 100 : 0;
      
      const responseTimes = variantResults
        .filter(r => r.responseTime !== undefined)
        .map(r => r.responseTime!);
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;
      
      const engagementScore = (openRate * 0.4 + clickRate * 0.3 + conversionRate * 0.3) / 100;

      return {
        id: variant.id,
        name: variant.name,
        isControl: variant.isControl,
        participantCount,
        metrics: {
          sentCount,
          openCount,
          clickCount,
          conversionCount,
          openRate,
          clickRate,
          conversionRate,
          avgResponseTime,
          engagementScore
        }
      };
    });

    // Calculate statistical significance
    const hasStatisticalSignificance = this.calculateStatisticalSignificance(
      variantAnalytics,
      test.metrics.primary,
      test.confidenceLevel
    );

    // Determine winner
    const winner = this.determineWinner(variantAnalytics, test.metrics.primary);

    // Generate recommendations
    const recommendations = this.generateRecommendations(test, variantAnalytics, winner);

    return {
      testId,
      isComplete: test.status === 'completed',
      hasStatisticalSignificance,
      confidenceLevel: test.confidenceLevel,
      sampleSize,
      variants: variantAnalytics,
      winner,
      recommendations
    };
  }

  private calculateStatisticalSignificance(
    variants: any[],
    primaryMetric: string,
    confidenceLevel: number
  ): boolean {
    // Simplified statistical significance calculation
    // In a real implementation, you'd use proper statistical tests (chi-square, t-test, etc.)
    
    const control = variants.find(v => v.isControl);
    if (!control || variants.length < 2) return false;

    const sampleSizeThreshold = confidenceLevel === 99 ? 200 : confidenceLevel === 95 ? 100 : 50;
    const minSampleSize = Math.min(...variants.map(v => v.participantCount));
    
    if (minSampleSize < sampleSizeThreshold) return false;

    // Simple difference threshold based on confidence level
    const significanceThreshold = confidenceLevel === 99 ? 0.15 : confidenceLevel === 95 ? 0.10 : 0.05;
    
    const controlRate = this.getMetricValue(control.metrics, primaryMetric);
    const maxDifference = Math.max(
      ...variants
        .filter(v => !v.isControl)
        .map(v => Math.abs(this.getMetricValue(v.metrics, primaryMetric) - controlRate))
    );

    return maxDifference > significanceThreshold;
  }

  private getMetricValue(metrics: any, metricName: string): number {
    switch (metricName) {
      case 'open_rate': return metrics.openRate / 100;
      case 'click_rate': return metrics.clickRate / 100;
      case 'conversion_rate': return metrics.conversionRate / 100;
      case 'engagement_score': return metrics.engagementScore;
      default: return 0;
    }
  }

  private determineWinner(variants: any[], primaryMetric: string): ABTestAnalytics['winner'] {
    if (variants.length < 2) return undefined;

    const control = variants.find(v => v.isControl);
    if (!control) return undefined;

    const controlValue = this.getMetricValue(control.metrics, primaryMetric);
    
    let bestVariant = control;
    let bestValue = controlValue;
    
    variants.forEach(variant => {
      const value = this.getMetricValue(variant.metrics, primaryMetric);
      if (value > bestValue) {
        bestValue = value;
        bestVariant = variant;
      }
    });

    if (bestVariant.id === control.id) return undefined;

    const improvement = ((bestValue - controlValue) / controlValue) * 100;
    
    return {
      variantId: bestVariant.id,
      improvement,
      metric: primaryMetric
    };
  }

  private generateRecommendations(
    test: ABTest,
    variants: any[],
    winner: ABTestAnalytics['winner']
  ): string[] {
    const recommendations: string[] = [];
    
    if (winner) {
      recommendations.push(
        `🏆 ${winner.variantId} outperformed control by ${winner.improvement.toFixed(1)}% on ${winner.metric.replace('_', ' ')}`
      );
      recommendations.push('Consider implementing the winning variant for all users');
    } else {
      recommendations.push('No clear winner detected - consider running the test longer');
    }

    const control = variants.find(v => v.isControl);
    if (control) {
      const avgPerformance = variants.reduce((sum, v) => 
        sum + this.getMetricValue(v.metrics, test.metrics.primary), 0) / variants.length;
      
      if (avgPerformance < 0.3) {
        recommendations.push('Overall performance is low - consider testing fundamentally different approaches');
      }
      
      if (control.participantCount < test.minimumSampleSize) {
        recommendations.push(`Increase sample size - need ${test.minimumSampleSize - control.participantCount} more participants`);
      }
    }

    // Check for performance patterns
    const engagementScores = variants.map(v => v.metrics.engagementScore);
    const maxEngagement = Math.max(...engagementScores);
    const minEngagement = Math.min(...engagementScores);
    
    if (maxEngagement - minEngagement > 0.2) {
      recommendations.push('Significant variation in engagement - analyze what makes the best variant effective');
    }

    return recommendations;
  }

  public getAllTests(): ABTest[] {
    return [...this.tests];
  }

  public getActiveTests(): ABTest[] {
    return this.tests.filter(test => test.status === 'running');
  }

  public getTest(testId: string): ABTest | undefined {
    return this.tests.find(test => test.id === testId);
  }

  public updateTestStatus(testId: string, status: ABTest['status']): boolean {
    const test = this.tests.find(t => t.id === testId);
    if (test) {
      test.status = status;
      this.saveData();
      return true;
    }
    return false;
  }

  public deleteTest(testId: string): boolean {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index !== -1) {
      this.tests.splice(index, 1);
      // Also remove associated results
      this.results = this.results.filter(r => r.testId !== testId);
      this.saveData();
      return true;
    }
    return false;
  }

  // Integration with notification system
  public async sendTestNotification(
    baseNotification: WellnessNotification,
    testId: string,
    userId: string
  ): Promise<string | null> {
    const variant = this.getVariantForUser(testId, userId);
    if (!variant) {
      return null;
    }

    // Merge variant template with base notification
    const testNotification: WellnessNotification = {
      ...baseNotification,
      ...variant.notificationTemplate,
      id: `test_${testId}_${variant.id}_${Date.now()}`
    };

    // Record test participation
    this.recordTestResult({
      testId,
      variantId: variant.id,
      userId,
      notificationId: testNotification.id,
      opened: false,
      clicked: false,
      converted: false
    });

    // Send notification through normal service
    // This would integrate with the main notification service
    console.log('Sending test notification:', {
      testId,
      variantId: variant.id,
      notification: testNotification
    });

    return testNotification.id;
  }
}

export const notificationABTestingService = new NotificationABTestingService();
export default notificationABTestingService;