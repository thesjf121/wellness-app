// Session management service for tracking user sessions and activity

import { errorService } from './errorService';

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    vendor?: string;
    language: string;
  };
  ipAddress?: string;
  location?: {
    city?: string;
    country?: string;
  };
  startedAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface SessionActivity {
  sessionId: string;
  timestamp: Date;
  action: string;
  details?: any;
}

class SessionService {
  private readonly SESSION_KEY = 'wellness_app_session';
  private readonly ACTIVITY_KEY = 'wellness_app_activity';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSIONS = 5; // Maximum concurrent sessions per user
  
  private currentSession: SessionInfo | null = null;
  private activityTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize session management
   */
  initialize(userId: string): void {
    try {
      // Create new session
      this.currentSession = this.createSession(userId);
      this.saveSession(this.currentSession);
      
      // Start activity monitoring
      this.startActivityMonitoring();
      
      // Clean up old sessions
      this.cleanupOldSessions(userId);
      
      errorService.logInfo('Session initialized', { 
        sessionId: this.currentSession.id,
        userId 
      });
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.initialize' 
      });
    }
  }

  /**
   * Create a new session
   */
  private createSession(userId: string): SessionInfo {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT);
    
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        language: navigator.language
      },
      startedAt: now,
      lastActiveAt: now,
      expiresAt,
      isActive: true
    };
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionInfo | null {
    if (!this.currentSession) {
      const savedSession = this.loadSession();
      if (savedSession && this.isSessionValid(savedSession)) {
        this.currentSession = savedSession;
      }
    }
    return this.currentSession;
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): SessionInfo[] {
    try {
      const allSessions = this.loadAllSessions();
      return allSessions
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.getUserSessions' 
      });
      return [];
    }
  }

  /**
   * Revoke a specific session
   */
  revokeSession(sessionId: string): void {
    try {
      const allSessions = this.loadAllSessions();
      const updatedSessions = allSessions.map(session => {
        if (session.id === sessionId) {
          return { ...session, isActive: false };
        }
        return session;
      });
      
      this.saveAllSessions(updatedSessions);
      
      // If revoking current session, clear it
      if (this.currentSession?.id === sessionId) {
        this.currentSession = null;
        this.stopActivityMonitoring();
      }
      
      errorService.logInfo('Session revoked', { sessionId });
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.revokeSession' 
      });
    }
  }

  /**
   * Revoke all sessions except current
   */
  revokeOtherSessions(userId: string): void {
    try {
      const currentSessionId = this.currentSession?.id;
      if (!currentSessionId) return;
      
      const allSessions = this.loadAllSessions();
      const updatedSessions = allSessions.map(session => {
        if (session.userId === userId && session.id !== currentSessionId) {
          return { ...session, isActive: false };
        }
        return session;
      });
      
      this.saveAllSessions(updatedSessions);
      
      errorService.logInfo('Other sessions revoked', { 
        userId, 
        currentSessionId 
      });
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.revokeOtherSessions' 
      });
    }
  }

  /**
   * Update session activity
   */
  updateActivity(action: string, details?: any): void {
    if (!this.currentSession) return;
    
    try {
      // Update last active time
      this.currentSession.lastActiveAt = new Date();
      this.currentSession.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);
      this.saveSession(this.currentSession);
      
      // Log activity
      const activity: SessionActivity = {
        sessionId: this.currentSession.id,
        timestamp: new Date(),
        action,
        details
      };
      
      this.logActivity(activity);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.updateActivity' 
      });
    }
  }

  /**
   * Get session activity history
   */
  getActivityHistory(sessionId?: string): SessionActivity[] {
    try {
      const activities = this.loadActivities();
      if (sessionId) {
        return activities.filter(a => a.sessionId === sessionId);
      }
      return activities;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.getActivityHistory' 
      });
      return [];
    }
  }

  /**
   * Start activity monitoring
   */
  private startActivityMonitoring(): void {
    // Monitor user activity
    document.addEventListener('click', this.handleUserActivity);
    document.addEventListener('keypress', this.handleUserActivity);
    
    // Check session validity periodically
    this.activityTimer = setInterval(() => {
      if (this.currentSession && !this.isSessionValid(this.currentSession)) {
        this.handleSessionExpired();
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop activity monitoring
   */
  private stopActivityMonitoring(): void {
    document.removeEventListener('click', this.handleUserActivity);
    document.removeEventListener('keypress', this.handleUserActivity);
    
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Handle user activity
   */
  private handleUserActivity = (): void => {
    this.updateActivity('user_interaction');
  };

  /**
   * Handle expired session
   */
  private handleSessionExpired(): void {
    if (!this.currentSession) return;
    
    this.currentSession.isActive = false;
    this.saveSession(this.currentSession);
    this.currentSession = null;
    this.stopActivityMonitoring();
    
    // Notify user (in production, would trigger re-authentication)
    errorService.logInfo('Session expired');
  }

  /**
   * Check if session is valid
   */
  private isSessionValid(session: SessionInfo): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    return session.isActive && expiresAt > now;
  }

  /**
   * Clean up old sessions
   */
  private cleanupOldSessions(userId: string): void {
    try {
      const allSessions = this.loadAllSessions();
      const userSessions = allSessions
        .filter(s => s.userId === userId && s.isActive)
        .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
      
      // Keep only the most recent MAX_SESSIONS
      if (userSessions.length > this.MAX_SESSIONS) {
        const sessionsToRevoke = userSessions.slice(this.MAX_SESSIONS);
        const updatedSessions = allSessions.map(session => {
          if (sessionsToRevoke.find(s => s.id === session.id)) {
            return { ...session, isActive: false };
          }
          return session;
        });
        
        this.saveAllSessions(updatedSessions);
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'SessionService.cleanupOldSessions' 
      });
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: SessionInfo): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    // Also update in all sessions
    const allSessions = this.loadAllSessions();
    const index = allSessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      allSessions[index] = session;
    } else {
      allSessions.push(session);
    }
    this.saveAllSessions(allSessions);
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): SessionInfo | null {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  /**
   * Load all sessions
   */
  private loadAllSessions(): SessionInfo[] {
    const stored = localStorage.getItem('wellness_app_all_sessions');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * Save all sessions
   */
  private saveAllSessions(sessions: SessionInfo[]): void {
    localStorage.setItem('wellness_app_all_sessions', JSON.stringify(sessions));
  }

  /**
   * Log activity
   */
  private logActivity(activity: SessionActivity): void {
    const activities = this.loadActivities();
    activities.push(activity);
    
    // Keep only last 100 activities per session
    const grouped = activities.reduce((acc, a) => {
      if (!acc[a.sessionId]) acc[a.sessionId] = [];
      acc[a.sessionId].push(a);
      return acc;
    }, {} as Record<string, SessionActivity[]>);
    
    const trimmed: SessionActivity[] = [];
    Object.entries(grouped).forEach(([sessionId, sessionActivities]) => {
      trimmed.push(...sessionActivities.slice(-100));
    });
    
    localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(trimmed));
  }

  /**
   * Load activities
   */
  private loadActivities(): SessionActivity[] {
    const stored = localStorage.getItem(this.ACTIVITY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * Clear all session data
   */
  clearAllData(): void {
    this.currentSession = null;
    this.stopActivityMonitoring();
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
    localStorage.removeItem('wellness_app_all_sessions');
  }
}

// Create singleton instance
export const sessionService = new SessionService();

export default sessionService;