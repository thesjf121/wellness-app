/**
 * Bug Tracking System
 * Provides utilities for tracking, reporting, and managing bugs during testing
 */

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'accessibility' | 'compatibility';
  component: string;
  environment: {
    browser: string;
    os: string;
    device: string;
    version: string;
  };
  steps: string[];
  expected: string;
  actual: string;
  screenshot?: string;
  logs?: string[];
  createdAt: Date;
  updatedAt: Date;
  assignee?: string;
  reporter: string;
  tags: string[];
}

export interface BugReport {
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  bugsByCategory: { [key: string]: number };
  bugsBySeverity: { [key: string]: number };
  recentBugs: Bug[];
  trends: {
    newBugsToday: number;
    resolvedBugsToday: number;
    avgResolutionTime: number;
  };
}

class BugTracker {
  private bugs: Bug[] = [];
  private storageKey = 'wellness-app-bugs';

  constructor() {
    this.loadBugs();
  }

  /**
   * Load bugs from localStorage
   */
  private loadBugs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.bugs = parsed.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          updatedAt: new Date(bug.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load bugs from storage:', error);
    }
  }

  /**
   * Save bugs to localStorage
   */
  private saveBugs(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bugs));
    } catch (error) {
      console.error('Failed to save bugs to storage:', error);
    }
  }

  /**
   * Generate unique bug ID
   */
  private generateBugId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `BUG-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Detect current environment
   */
  private detectEnvironment(): Bug['environment'] {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Unknown';

    // Detect browser
    if (ua.includes('Chrome/')) browser = 'Chrome ' + ua.match(/Chrome\/([\d.]+)/)?.[1];
    else if (ua.includes('Firefox/')) browser = 'Firefox ' + ua.match(/Firefox\/([\d.]+)/)?.[1];
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari ' + ua.match(/Version\/([\d.]+)/)?.[1];
    else if (ua.includes('Edge/')) browser = 'Edge ' + ua.match(/Edge\/([\d.]+)/)?.[1];

    // Detect OS
    if (ua.includes('Windows NT')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('iPhone OS')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';

    // Detect device type
    if (ua.includes('Mobile')) device = 'Mobile';
    else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';
    else device = 'Desktop';

    return {
      browser,
      os,
      device,
      version: window.location.hostname === 'localhost' ? 'Development' : 'Production',
    };
  }

  /**
   * Create a new bug report
   */
  createBug(bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt' | 'environment'>): Bug {
    const bug: Bug = {
      ...bugData,
      id: this.generateBugId(),
      environment: this.detectEnvironment(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bugs.push(bug);
    this.saveBugs();

    console.log('New bug created:', bug.id, '-', bug.title);
    return bug;
  }

  /**
   * Update an existing bug
   */
  updateBug(bugId: string, updates: Partial<Bug>): Bug | null {
    const bugIndex = this.bugs.findIndex(bug => bug.id === bugId);
    if (bugIndex === -1) {
      console.error('Bug not found:', bugId);
      return null;
    }

    this.bugs[bugIndex] = {
      ...this.bugs[bugIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveBugs();
    return this.bugs[bugIndex];
  }

  /**
   * Get bug by ID
   */
  getBug(bugId: string): Bug | null {
    return this.bugs.find(bug => bug.id === bugId) || null;
  }

  /**
   * Get all bugs
   */
  getAllBugs(): Bug[] {
    return [...this.bugs];
  }

  /**
   * Get bugs by filter criteria
   */
  getBugs(filter: {
    status?: Bug['status'][];
    severity?: Bug['severity'][];
    category?: Bug['category'][];
    component?: string;
    assignee?: string;
    reporter?: string;
    tags?: string[];
  } = {}): Bug[] {
    return this.bugs.filter(bug => {
      if (filter.status && !filter.status.includes(bug.status)) return false;
      if (filter.severity && !filter.severity.includes(bug.severity)) return false;
      if (filter.category && !filter.category.includes(bug.category)) return false;
      if (filter.component && bug.component !== filter.component) return false;
      if (filter.assignee && bug.assignee !== filter.assignee) return false;
      if (filter.reporter && bug.reporter !== filter.reporter) return false;
      if (filter.tags && !filter.tags.some(tag => bug.tags.includes(tag))) return false;
      return true;
    });
  }

  /**
   * Generate bug report
   */
  generateReport(): BugReport {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalBugs = this.bugs.length;
    const openBugs = this.bugs.filter(bug => ['open', 'in_progress'].includes(bug.status)).length;
    const criticalBugs = this.bugs.filter(bug => bug.severity === 'critical' && bug.status !== 'closed').length;

    // Group by category
    const bugsByCategory: { [key: string]: number } = {};
    this.bugs.forEach(bug => {
      bugsByCategory[bug.category] = (bugsByCategory[bug.category] || 0) + 1;
    });

    // Group by severity
    const bugsBySeverity: { [key: string]: number } = {};
    this.bugs.forEach(bug => {
      bugsBySeverity[bug.severity] = (bugsBySeverity[bug.severity] || 0) + 1;
    });

    // Recent bugs (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentBugs = this.bugs
      .filter(bug => bug.createdAt >= sevenDaysAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Trends
    const newBugsToday = this.bugs.filter(bug => bug.createdAt >= today).length;
    const resolvedBugsToday = this.bugs.filter(bug => 
      bug.status === 'resolved' && bug.updatedAt >= today
    ).length;

    // Calculate average resolution time
    const resolvedBugs = this.bugs.filter(bug => bug.status === 'resolved');
    const avgResolutionTime = resolvedBugs.length > 0
      ? resolvedBugs.reduce((sum, bug) => {
          return sum + (bug.updatedAt.getTime() - bug.createdAt.getTime());
        }, 0) / resolvedBugs.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalBugs,
      openBugs,
      criticalBugs,
      bugsByCategory,
      bugsBySeverity,
      recentBugs,
      trends: {
        newBugsToday,
        resolvedBugsToday,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      },
    };
  }

  /**
   * Delete a bug
   */
  deleteBug(bugId: string): boolean {
    const bugIndex = this.bugs.findIndex(bug => bug.id === bugId);
    if (bugIndex === -1) return false;

    this.bugs.splice(bugIndex, 1);
    this.saveBugs();
    return true;
  }

  /**
   * Export bugs to JSON
   */
  exportBugs(filter?: Parameters<typeof this.getBugs>[0]): string {
    const bugsToExport = filter ? this.getBugs(filter) : this.bugs;
    return JSON.stringify(bugsToExport, null, 2);
  }

  /**
   * Import bugs from JSON
   */
  importBugs(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const bugsData = JSON.parse(jsonData);
      
      if (!Array.isArray(bugsData)) {
        throw new Error('Data must be an array of bugs');
      }

      bugsData.forEach((bugData, index) => {
        try {
          // Validate required fields
          const requiredFields = ['title', 'description', 'severity', 'priority', 'status', 'category'];
          for (const field of requiredFields) {
            if (!bugData[field]) {
              throw new Error(`Missing required field: ${field}`);
            }
          }

          // Create bug with new ID to avoid conflicts
          const bug: Bug = {
            ...bugData,
            id: this.generateBugId(),
            createdAt: bugData.createdAt ? new Date(bugData.createdAt) : new Date(),
            updatedAt: bugData.updatedAt ? new Date(bugData.updatedAt) : new Date(),
            environment: bugData.environment || this.detectEnvironment(),
          };

          this.bugs.push(bug);
          imported++;
        } catch (error) {
          errors.push(`Bug ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      if (imported > 0) {
        this.saveBugs();
      }

      return {
        success: errors.length === 0,
        imported,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Failed to parse JSON'],
      };
    }
  }

  /**
   * Clear all bugs (use with caution)
   */
  clearAllBugs(): void {
    this.bugs = [];
    this.saveBugs();
  }
}

// Utility functions for automated bug detection

/**
 * Automatically detect and report JavaScript errors
 */
export const setupAutomaticErrorReporting = (bugTracker: BugTracker): void => {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    bugTracker.createBug({
      title: `JavaScript Error: ${event.message}`,
      description: `Error occurred in ${event.filename}:${event.lineno}:${event.colno}`,
      severity: 'high',
      priority: 'high',
      status: 'open',
      category: 'functionality',
      component: 'JavaScript',
      steps: ['Error occurred automatically'],
      expected: 'No error should occur',
      actual: event.message,
      logs: [`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`],
      reporter: 'Automatic Error Detection',
      tags: ['automatic', 'javascript-error'],
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    bugTracker.createBug({
      title: `Unhandled Promise Rejection: ${event.reason}`,
      description: `Promise rejection was not handled: ${event.reason}`,
      severity: 'medium',
      priority: 'medium',
      status: 'open',
      category: 'functionality',
      component: 'JavaScript',
      steps: ['Promise rejection occurred automatically'],
      expected: 'Promise should be handled properly',
      actual: `Unhandled rejection: ${event.reason}`,
      logs: [`Unhandled promise rejection: ${event.reason}`],
      reporter: 'Automatic Error Detection',
      tags: ['automatic', 'promise-rejection'],
    });
  });
};

/**
 * Detect performance issues and create bugs
 */
export const detectPerformanceIssues = (bugTracker: BugTracker): void => {
  // Monitor slow operations
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      if (duration > 5000) { // 5 seconds threshold
        bugTracker.createBug({
          title: `Slow API Request: ${args[0]}`,
          description: `API request took ${Math.round(duration)}ms to complete`,
          severity: 'medium',
          priority: 'medium',
          status: 'open',
          category: 'performance',
          component: 'API',
          steps: [`Make request to ${args[0]}`],
          expected: 'Request should complete within 5 seconds',
          actual: `Request took ${Math.round(duration)}ms`,
          logs: [`Slow request: ${args[0]} - ${Math.round(duration)}ms`],
          reporter: 'Performance Monitor',
          tags: ['automatic', 'performance', 'slow-api'],
        });
      }
      
      return response;
    } catch (error) {
      const duration = performance.now() - start;
      bugTracker.createBug({
        title: `Failed API Request: ${args[0]}`,
        description: `API request failed after ${Math.round(duration)}ms`,
        severity: 'high',
        priority: 'high',
        status: 'open',
        category: 'functionality',
        component: 'API',
        steps: [`Make request to ${args[0]}`],
        expected: 'Request should succeed',
        actual: `Request failed: ${error}`,
        logs: [`Failed request: ${args[0]} - ${error}`],
        reporter: 'Performance Monitor',
        tags: ['automatic', 'api-error'],
      });
      throw error;
    }
  };
};

/**
 * Create bug from test failure
 */
export const createBugFromTestFailure = (
  bugTracker: BugTracker,
  testName: string,
  error: Error,
  component: string
): Bug => {
  return bugTracker.createBug({
    title: `Test Failure: ${testName}`,
    description: `Test "${testName}" failed with error: ${error.message}`,
    severity: 'medium',
    priority: 'medium',
    status: 'open',
    category: 'functionality',
    component,
    steps: [`Run test: ${testName}`],
    expected: 'Test should pass',
    actual: `Test failed: ${error.message}`,
    logs: [error.stack || error.message],
    reporter: 'Test Suite',
    tags: ['test-failure', 'automatic'],
  });
};

// Create singleton instance
export const bugTracker = new BugTracker();

// Export utility functions
export const BugUtils = {
  setupAutomaticErrorReporting: () => setupAutomaticErrorReporting(bugTracker),
  detectPerformanceIssues: () => detectPerformanceIssues(bugTracker),
  createBugFromTestFailure: (testName: string, error: Error, component: string) =>
    createBugFromTestFailure(bugTracker, testName, error, component),
};