// Error tracking and logging service

export interface ErrorInfo {
  message: string;
  stack?: string;
  userId?: string;
  context?: Record<string, any>;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
}

class ErrorService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

  /**
   * Log an error to console and external service
   */
  logError(error: Error, context?: Record<string, any>, userId?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      userId,
      context,
      timestamp: new Date(),
      level: 'error'
    };

    // Always log to console in development
    if (this.isDevelopment) {
      console.error('Error logged:', errorInfo);
    }

    // Send to external service in production
    if (!this.isDevelopment && this.isAnalyticsEnabled) {
      this.sendToExternalService(errorInfo);
    }

    // Store locally for offline scenarios
    this.storeLocally(errorInfo);
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Record<string, any>, userId?: string): void {
    const errorInfo: ErrorInfo = {
      message,
      userId,
      context,
      timestamp: new Date(),
      level: 'warning'
    };

    if (this.isDevelopment) {
      console.warn('Warning logged:', errorInfo);
    }

    if (!this.isDevelopment && this.isAnalyticsEnabled) {
      this.sendToExternalService(errorInfo);
    }
  }

  /**
   * Log general information
   */
  logInfo(message: string, context?: Record<string, any>, userId?: string): void {
    const errorInfo: ErrorInfo = {
      message,
      userId,
      context,
      timestamp: new Date(),
      level: 'info'
    };

    if (this.isDevelopment) {
      console.info('Info logged:', errorInfo);
    }

    if (!this.isDevelopment && this.isAnalyticsEnabled) {
      this.sendToExternalService(errorInfo);
    }
  }

  /**
   * Log user action for analytics
   */
  logUserAction(action: string, context?: Record<string, any>, userId?: string): void {
    const actionInfo: ErrorInfo = {
      message: `User Action: ${action}`,
      userId,
      context,
      timestamp: new Date(),
      level: 'info'
    };

    if (this.isDevelopment) {
      console.log('User action logged:', actionInfo);
    }

    if (this.isAnalyticsEnabled) {
      this.storeLocally(actionInfo);
    }
  }

  /**
   * Handle React error boundary errors
   */
  handleReactError(error: Error, errorInfo: { componentStack?: string }): void {
    this.logError(error, {
      componentStack: errorInfo.componentStack || 'Unknown',
      type: 'React Error Boundary'
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = new Error(event.reason?.message || 'Unhandled Promise Rejection');
    this.logError(error, {
      reason: event.reason,
      type: 'Unhandled Promise Rejection'
    });
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event: ErrorEvent): void {
    const error = new Error(event.message);
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
    
    this.logError(error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'Global Error'
    });
  }

  /**
   * Send error to external service (Sentry, LogRocket, etc.)
   */
  private async sendToExternalService(errorInfo: ErrorInfo): Promise<void> {
    try {
      // TODO: Implement actual external service integration
      // Example: Sentry.captureException(errorInfo);
      
      // For now, we'll simulate sending to an API
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to send error to external service');
      }
    } catch (err) {
      // Don't log this error to avoid infinite loops
      console.warn('Failed to send error to external service:', err);
    }
  }

  /**
   * Store error locally for offline scenarios
   */
  private storeLocally(errorInfo: ErrorInfo): void {
    try {
      const storageKey = 'wellness_app_errors';
      const existingErrors = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Keep only last 50 errors to prevent storage bloat
      const updatedErrors = [...existingErrors, errorInfo].slice(-50);
      
      localStorage.setItem(storageKey, JSON.stringify(updatedErrors));
    } catch (err) {
      // localStorage might be full or unavailable
      console.warn('Failed to store error locally:', err);
    }
  }

  /**
   * Get locally stored errors
   */
  getLocalErrors(): ErrorInfo[] {
    try {
      const storageKey = 'wellness_app_errors';
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear locally stored errors
   */
  clearLocalErrors(): void {
    try {
      localStorage.removeItem('wellness_app_errors');
    } catch (err) {
      console.warn('Failed to clear local errors:', err);
    }
  }

  /**
   * Initialize error handlers
   */
  initialize(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    this.logInfo('Error service initialized');
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// Export individual functions for convenience
export const logUserAction = (action: string, context?: Record<string, any>, userId?: string) => {
  errorService.logUserAction(action, context, userId);
};

export default errorService;

// Initialize on module load
errorService.initialize();