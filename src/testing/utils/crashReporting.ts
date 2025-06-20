/**
 * Crash Reporting System
 * Provides utilities for detecting, capturing, and reporting application crashes
 */

export interface CrashReport {
  id: string;
  timestamp: Date;
  type: 'javascript_error' | 'unhandled_rejection' | 'network_error' | 'render_error' | 'memory_error';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  environment: {
    browser: string;
    os: string;
    device: string;
    version: string;
    viewport: { width: number; height: number };
  };
  user?: {
    id: string;
    role: string;
    sessionId: string;
  };
  context: {
    route: string;
    component?: string;
    action?: string;
    state?: any;
  };
  performance: {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    timing: {
      loadTime: number;
      renderTime: number;
    };
  };
  breadcrumbs: Array<{
    timestamp: Date;
    category: 'navigation' | 'user_action' | 'network' | 'console' | 'error';
    message: string;
    data?: any;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface CrashAnalytics {
  totalCrashes: number;
  crashesByType: { [key: string]: number };
  crashesByBrowser: { [key: string]: number };
  crashesByComponent: { [key: string]: number };
  recentCrashes: CrashReport[];
  trends: {
    crashesLast24h: number;
    crashesLast7d: number;
    crashRate: number;
    mostAffectedComponents: string[];
  };
}

class CrashReporter {
  private crashes: CrashReport[] = [];
  private breadcrumbs: CrashReport['breadcrumbs'] = [];
  private maxBreadcrumbs = 50;
  private storageKey = 'wellness-app-crashes';
  private breadcrumbKey = 'wellness-app-breadcrumbs';
  private isEnabled = true;
  private maxCrashes = 100; // Limit stored crashes

  constructor() {
    this.loadCrashes();
    this.loadBreadcrumbs();
    this.setupGlobalHandlers();
  }

  /**
   * Enable or disable crash reporting
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Load crashes from localStorage
   */
  private loadCrashes(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.crashes = parsed.map((crash: any) => ({
          ...crash,
          timestamp: new Date(crash.timestamp),
          breadcrumbs: crash.breadcrumbs?.map((bc: any) => ({
            ...bc,
            timestamp: new Date(bc.timestamp),
          })) || [],
        }));
      }
    } catch (error) {
      console.error('Failed to load crash reports:', error);
    }
  }

  /**
   * Save crashes to localStorage
   */
  private saveCrashes(): void {
    try {
      // Keep only the most recent crashes
      const crashesToSave = this.crashes.slice(-this.maxCrashes);
      localStorage.setItem(this.storageKey, JSON.stringify(crashesToSave));
    } catch (error) {
      console.error('Failed to save crash reports:', error);
    }
  }

  /**
   * Load breadcrumbs from localStorage
   */
  private loadBreadcrumbs(): void {
    try {
      const stored = localStorage.getItem(this.breadcrumbKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.breadcrumbs = parsed.map((bc: any) => ({
          ...bc,
          timestamp: new Date(bc.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load breadcrumbs:', error);
    }
  }

  /**
   * Save breadcrumbs to localStorage
   */
  private saveBreadcrumbs(): void {
    try {
      const breadcrumbsToSave = this.breadcrumbs.slice(-this.maxBreadcrumbs);
      localStorage.setItem(this.breadcrumbKey, JSON.stringify(breadcrumbsToSave));
    } catch (error) {
      console.error('Failed to save breadcrumbs:', error);
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportCrash({
        type: 'javascript_error',
        message: event.message,
        stack: event.error?.stack,
        context: {
          route: window.location.pathname,
          component: this.getCurrentComponent(),
        },
        severity: this.determineSeverity(event.error),
        tags: ['javascript', 'automatic'],
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportCrash({
        type: 'unhandled_rejection',
        message: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          route: window.location.pathname,
          component: this.getCurrentComponent(),
        },
        severity: 'medium',
        tags: ['promise', 'automatic'],
      });
    });

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // Check every 30 seconds
    }

    // Monitor network errors
    this.setupNetworkErrorMonitoring();
  }

  /**
   * Check memory usage and report if excessive
   */
  private checkMemoryUsage(): void {
    const memory = (performance as any).memory;
    if (memory) {
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usageRatio > 0.9) { // 90% memory usage
        this.reportCrash({
          type: 'memory_error',
          message: `High memory usage: ${Math.round(usageRatio * 100)}%`,
          context: {
            route: window.location.pathname,
            component: this.getCurrentComponent(),
          },
          severity: usageRatio > 0.95 ? 'critical' : 'high',
          tags: ['memory', 'performance', 'automatic'],
        });
      }
    }
  }

  /**
   * Set up network error monitoring
   */
  private setupNetworkErrorMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 500) {
          this.reportCrash({
            type: 'network_error',
            message: `Network error: ${response.status} ${response.statusText}`,
            context: {
              route: window.location.pathname,
              action: `${args[1]?.method || 'GET'} ${args[0]}`,
            },
            severity: 'medium',
            tags: ['network', 'api', 'automatic'],
          });
        }
        
        return response;
      } catch (error) {
        this.reportCrash({
          type: 'network_error',
          message: `Network request failed: ${error}`,
          stack: error instanceof Error ? error.stack : undefined,
          context: {
            route: window.location.pathname,
            action: `${args[1]?.method || 'GET'} ${args[0]}`,
          },
          severity: 'high',
          tags: ['network', 'api', 'automatic'],
        });
        throw error;
      }
    };
  }

  /**
   * Generate unique crash ID
   */
  private generateCrashId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CRASH-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Detect current environment
   */
  private detectEnvironment(): CrashReport['environment'] {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Unknown';

    // Detect browser
    if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Edge/')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
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
      version: process.env.NODE_ENV === 'development' ? 'Development' : 'Production',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  /**
   * Get current component name (simplified)
   */
  private getCurrentComponent(): string {
    // Try to get from React DevTools or other debugging info
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length > 0) {
      return segments[segments.length - 1] || 'Root';
    }
    
    return 'Unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): CrashReport['severity'] {
    if (!error) return 'low';
    
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Critical errors
    if (message.includes('typeerror') && message.includes('undefined')) return 'critical';
    if (message.includes('referenceerror')) return 'critical';
    if (message.includes('memory') || message.includes('heap')) return 'critical';
    if (stack.includes('react') && stack.includes('render')) return 'high';
    
    // High severity
    if (message.includes('network') || message.includes('fetch')) return 'high';
    if (message.includes('timeout')) return 'high';
    
    // Medium severity
    if (message.includes('warning')) return 'medium';
    
    return 'medium';
  }

  /**
   * Capture performance metrics
   */
  private capturePerformanceMetrics(): CrashReport['performance'] {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    
    const memory = (performance as any).memory;
    
    return {
      memory: memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      } : undefined,
      timing: {
        loadTime,
        renderTime,
      },
    };
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(
    category: CrashReport['breadcrumbs'][0]['category'],
    message: string,
    data?: any
  ): void {
    if (!this.isEnabled) return;

    const breadcrumb = {
      timestamp: new Date(),
      category,
      message,
      data,
    };

    this.breadcrumbs.push(breadcrumb);
    
    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
    
    this.saveBreadcrumbs();
  }

  /**
   * Report a crash
   */
  reportCrash(crashData: Partial<CrashReport>): CrashReport {
    if (!this.isEnabled) {
      return {} as CrashReport;
    }

    const crash: CrashReport = {
      id: this.generateCrashId(),
      timestamp: new Date(),
      type: crashData.type || 'javascript_error',
      message: crashData.message || 'Unknown error',
      stack: crashData.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      environment: this.detectEnvironment(),
      user: this.getCurrentUser(),
      context: {
        route: window.location.pathname,
        component: this.getCurrentComponent(),
        ...crashData.context,
      },
      performance: this.capturePerformanceMetrics(),
      breadcrumbs: [...this.breadcrumbs], // Copy current breadcrumbs
      severity: crashData.severity || 'medium',
      tags: crashData.tags || [],
    };

    this.crashes.push(crash);
    this.saveCrashes();

    // Add crash as breadcrumb for future crashes
    this.addBreadcrumb('error', `Crash reported: ${crash.message}`, {
      crashId: crash.id,
      type: crash.type,
    });

    console.error('Crash reported:', crash.id, '-', crash.message);
    
    // In production, you would send this to a crash reporting service
    this.sendToService(crash);

    return crash;
  }

  /**
   * Get current user info (if available)
   */
  private getCurrentUser(): CrashReport['user'] {
    try {
      // Try to get user info from localStorage or context
      const userStr = localStorage.getItem('user') || localStorage.getItem('auth-user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          id: user.id || 'unknown',
          role: user.role || 'unknown',
          sessionId: sessionStorage.getItem('session-id') || 'unknown',
        };
      }
    } catch (error) {
      // Ignore errors getting user info
    }
    return undefined;
  }

  /**
   * Send crash report to external service (mock)
   */
  private sendToService(crash: CrashReport): void {
    // In production, send to crash reporting service like Sentry, Bugsnag, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log('Would send crash report to service:', crash);
    } else {
      // Example: send to hypothetical crash service
      fetch('/api/crashes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crash),
      }).catch(() => {
        // Silently fail if crash reporting service is down
      });
    }
  }

  /**
   * Get all crashes
   */
  getCrashes(): CrashReport[] {
    return [...this.crashes];
  }

  /**
   * Get crashes by filter
   */
  getCrashesByFilter(filter: {
    type?: CrashReport['type'][];
    severity?: CrashReport['severity'][];
    since?: Date;
    component?: string;
  }): CrashReport[] {
    return this.crashes.filter(crash => {
      if (filter.type && !filter.type.includes(crash.type)) return false;
      if (filter.severity && !filter.severity.includes(crash.severity)) return false;
      if (filter.since && crash.timestamp < filter.since) return false;
      if (filter.component && crash.context.component !== filter.component) return false;
      return true;
    });
  }

  /**
   * Generate crash analytics
   */
  generateAnalytics(): CrashAnalytics {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalCrashes = this.crashes.length;
    
    // Group by type
    const crashesByType: { [key: string]: number } = {};
    this.crashes.forEach(crash => {
      crashesByType[crash.type] = (crashesByType[crash.type] || 0) + 1;
    });

    // Group by browser
    const crashesByBrowser: { [key: string]: number } = {};
    this.crashes.forEach(crash => {
      const browser = crash.environment.browser;
      crashesByBrowser[browser] = (crashesByBrowser[browser] || 0) + 1;
    });

    // Group by component
    const crashesByComponent: { [key: string]: number } = {};
    this.crashes.forEach(crash => {
      const component = crash.context.component || 'Unknown';
      crashesByComponent[component] = (crashesByComponent[component] || 0) + 1;
    });

    // Recent crashes
    const recentCrashes = this.crashes
      .filter(crash => crash.timestamp >= last7d)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Trends
    const crashesLast24h = this.crashes.filter(crash => crash.timestamp >= last24h).length;
    const crashesLast7d = this.crashes.filter(crash => crash.timestamp >= last7d).length;
    
    // Most affected components
    const mostAffectedComponents = Object.entries(crashesByComponent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([component]) => component);

    // Calculate crash rate (crashes per day)
    const daysSinceFirstCrash = this.crashes.length > 0 
      ? Math.max(1, (now.getTime() - this.crashes[0].timestamp.getTime()) / (24 * 60 * 60 * 1000))
      : 1;
    const crashRate = totalCrashes / daysSinceFirstCrash;

    return {
      totalCrashes,
      crashesByType,
      crashesByBrowser,
      crashesByComponent,
      recentCrashes,
      trends: {
        crashesLast24h,
        crashesLast7d,
        crashRate: Math.round(crashRate * 100) / 100,
        mostAffectedComponents,
      },
    };
  }

  /**
   * Clear all crash data
   */
  clearCrashes(): void {
    this.crashes = [];
    this.breadcrumbs = [];
    this.saveCrashes();
    this.saveBreadcrumbs();
  }

  /**
   * Export crash data
   */
  exportCrashes(): string {
    return JSON.stringify({
      crashes: this.crashes,
      breadcrumbs: this.breadcrumbs,
      exportedAt: new Date(),
    }, null, 2);
  }
}

// Create singleton instance
export const crashReporter = new CrashReporter();

// Utility functions for React components
export const CrashUtils = {
  /**
   * HOC for catching React component errors
   */
  withCrashReporting: <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    return class CrashBoundary extends React.Component<P, { hasError: boolean }> {
      constructor(props: P) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        crashReporter.reportCrash({
          type: 'render_error',
          message: error.message,
          stack: error.stack,
          context: {
            route: window.location.pathname,
            component: WrappedComponent.name || 'Unknown',
            state: errorInfo.componentStack,
          },
          severity: 'high',
          tags: ['react', 'render', 'component'],
        });
      }

      render() {
        if (this.state.hasError) {
          return <div>Something went wrong. The error has been reported.</div>;
        }

        return <WrappedComponent {...this.props} />;
      }
    };
  },

  /**
   * Hook for tracking user actions
   */
  useActionTracking: () => {
    return (action: string, data?: any) => {
      crashReporter.addBreadcrumb('user_action', action, data);
    };
  },

  /**
   * Hook for tracking navigation
   */
  useNavigationTracking: () => {
    React.useEffect(() => {
      crashReporter.addBreadcrumb('navigation', `Navigated to ${window.location.pathname}`);
    }, []);
  },
};

export default crashReporter;