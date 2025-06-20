/**
 * Environment configuration for production deployment
 * Centralizes all environment variable access and validation
 */

interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  
  // Authentication
  clerkPublishableKey: string;
  
  // AI Services
  geminiApiKey: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  
  // Feature Flags
  enableOfflineMode: boolean;
  enableAnalytics: boolean;
  
  // Health Integration
  healthKitEnabled: boolean;
  googleFitEnabled: boolean;
  
  // Video Storage (if using cloud provider)
  videoStorageProvider?: 'aws' | 'cloudinary' | 'vimeo';
  videoStorageApiKey?: string;
  videoStorageBucket?: string;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  private loadConfiguration(): EnvironmentConfig {
    return {
      // API Configuration
      apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      
      // Authentication
      clerkPublishableKey: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '',
      
      // AI Services
      geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
      
      // App Configuration
      appName: process.env.REACT_APP_APP_NAME || 'WellnessApp',
      appVersion: process.env.REACT_APP_APP_VERSION || '1.0.0',
      environment: (process.env.REACT_APP_ENVIRONMENT || 'development') as any,
      
      // Feature Flags
      enableOfflineMode: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true',
      enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
      
      // Health Integration
      healthKitEnabled: process.env.REACT_APP_HEALTH_KIT_ENABLED !== 'false',
      googleFitEnabled: process.env.REACT_APP_GOOGLE_FIT_ENABLED !== 'false',
      
      // Video Storage
      videoStorageProvider: process.env.REACT_APP_VIDEO_STORAGE_PROVIDER as any,
      videoStorageApiKey: process.env.REACT_APP_VIDEO_STORAGE_API_KEY,
      videoStorageBucket: process.env.REACT_APP_VIDEO_STORAGE_BUCKET,
    };
  }

  private validateConfiguration(): void {
    const errors: string[] = [];
    
    // Validate required configurations
    if (!this.config.clerkPublishableKey || 
        this.config.clerkPublishableKey === 'your_clerk_publishable_key_here') {
      errors.push('Missing or invalid REACT_APP_CLERK_PUBLISHABLE_KEY');
    }
    
    // Warn about optional configurations
    if (!this.config.geminiApiKey || 
        this.config.geminiApiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured - AI features will use offline mode');
    }
    
    if (errors.length > 0) {
      console.error('Environment configuration errors:', errors);
      
      // In development, show warning but continue
      if (this.config.environment === 'development') {
        console.warn('Running in development mode with configuration errors');
      } else {
        // In production, throw error
        throw new Error(`Environment configuration errors: ${errors.join(', ')}`);
      }
    }
  }

  /**
   * Get the full configuration object
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   */
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  /**
   * Check if running in staging
   */
  isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: 'offline' | 'analytics' | 'healthKit' | 'googleFit'): boolean {
    switch (feature) {
      case 'offline':
        return this.config.enableOfflineMode;
      case 'analytics':
        return this.config.enableAnalytics;
      case 'healthKit':
        return this.config.healthKitEnabled;
      case 'googleFit':
        return this.config.googleFitEnabled;
      default:
        return false;
    }
  }

  /**
   * Get API endpoint URL
   */
  getApiUrl(endpoint: string): string {
    const baseUrl = this.config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Log configuration (for debugging, excludes sensitive data)
   */
  logConfiguration(): void {
    console.group('Environment Configuration');
    console.log('Environment:', this.config.environment);
    console.log('App Name:', this.config.appName);
    console.log('App Version:', this.config.appVersion);
    console.log('API Base URL:', this.config.apiBaseUrl);
    console.log('Clerk Configured:', !!this.config.clerkPublishableKey);
    console.log('Gemini Configured:', !!this.config.geminiApiKey);
    console.log('Offline Mode:', this.config.enableOfflineMode);
    console.log('Analytics:', this.config.enableAnalytics);
    console.log('HealthKit:', this.config.healthKitEnabled);
    console.log('Google Fit:', this.config.googleFitEnabled);
    console.groupEnd();
  }
}

// Create singleton instance
export const environmentService = new EnvironmentService();

// Export convenience functions
export const getConfig = () => environmentService.getConfig();
export const getEnv = <K extends keyof EnvironmentConfig>(key: K) => environmentService.get(key);
export const isProduction = () => environmentService.isProduction();
export const isDevelopment = () => environmentService.isDevelopment();
export const isFeatureEnabled = (feature: 'offline' | 'analytics' | 'healthKit' | 'googleFit') => 
  environmentService.isFeatureEnabled(feature);