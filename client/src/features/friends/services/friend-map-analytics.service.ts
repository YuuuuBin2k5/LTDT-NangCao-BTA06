import { logger } from '../../../shared/utils/logger.utils';

/**
 * Analytics events for friend location map feature
 */
export enum FriendMapEvent {
  MAP_OPENED = 'friend_map_opened',
  FRIEND_MARKER_TAPPED = 'friend_marker_tapped',
  INTERACTION_SENT = 'interaction_sent',
  FRAME_CHANGED = 'avatar_frame_changed',
  PRIVACY_MODE_CHANGED = 'privacy_mode_changed',
  LOCATION_SHARED = 'location_shared',
  DIRECTIONS_OPENED = 'directions_opened',
  HISTORY_VIEWED = 'location_history_viewed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  OFFLINE_SYNC_COMPLETED = 'offline_sync_completed',
}

/**
 * Performance metrics for friend location map
 */
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class FriendMapAnalyticsService {
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionStartTime: number = Date.now();

  /**
   * Track a feature usage event
   */
  trackEvent(event: FriendMapEvent, properties?: Record<string, any>): void {
    logger.info(`📊 Analytics: ${event}`, properties);

    // In production, send to analytics service (e.g., Firebase Analytics, Mixpanel)
    // Example: analytics().logEvent(event, properties);
  }

  /**
   * Track interaction sent
   */
  trackInteractionSent(interactionType: string, friendId: string): void {
    this.trackEvent(FriendMapEvent.INTERACTION_SENT, {
      interactionType,
      friendId,
    });
  }

  /**
   * Track frame change
   */
  trackFrameChanged(frameId: string, unlocked: boolean): void {
    this.trackEvent(FriendMapEvent.FRAME_CHANGED, {
      frameId,
      unlocked,
    });
  }

  /**
   * Track privacy mode change
   */
  trackPrivacyModeChanged(mode: string): void {
    this.trackEvent(FriendMapEvent.PRIVACY_MODE_CHANGED, {
      mode,
    });
  }

  /**
   * Track location sharing
   */
  trackLocationShared(latitude: number, longitude: number): void {
    this.trackEvent(FriendMapEvent.LOCATION_SHARED, {
      hasCoordinates: true,
    });
  }

  /**
   * Track directions opened
   */
  trackDirectionsOpened(friendId: string, distance: number): void {
    this.trackEvent(FriendMapEvent.DIRECTIONS_OPENED, {
      friendId,
      distance,
    });
  }

  /**
   * Track achievement unlocked
   */
  trackAchievementUnlocked(achievementId: string): void {
    this.trackEvent(FriendMapEvent.ACHIEVEMENT_UNLOCKED, {
      achievementId,
    });
  }

  /**
   * Start performance measurement
   */
  startPerformanceMeasure(name: string): number {
    return Date.now();
  }

  /**
   * End performance measurement
   */
  endPerformanceMeasure(name: string, startTime: number): void {
    const duration = Date.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.performanceMetrics.push(metric);
    logger.info(`⚡ Performance: ${name}`, { duration: `${duration}ms` });

    // Keep only last 100 metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics.shift();
    }

    // In production, send to performance monitoring service
    // Example: performance().trace(name).putMetric('duration', duration);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  /**
   * Get average performance for a metric
   */
  getAveragePerformance(name: string): number {
    const metrics = this.performanceMetrics.filter((m) => m.name === name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Log error with context
   */
  logError(error: Error, context?: Record<string, any>): void {
    logger.error('Friend Map Error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });

    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionStartTime = Date.now();
    this.performanceMetrics = [];
  }
}

export const friendMapAnalytics = new FriendMapAnalyticsService();
