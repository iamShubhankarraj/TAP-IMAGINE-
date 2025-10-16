// lib/analytics.ts
/**
 * Analytics utility for tracking user events and interactions
 * This provides a centralized interface for analytics tracking
 * Placeholder implementation - integrate with your analytics provider (Google Analytics, Mixpanel, etc.)
 */

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
};

class Analytics {
  private isEnabled: boolean = true;
  private queue: AnalyticsEvent[] = [];

  constructor() {
    // Initialize analytics
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Placeholder: Initialize your analytics provider here
    // Example: Google Analytics, Mixpanel, Segment, etc.
    console.log('[Analytics] Initialized');
  }

  /**
   * Track a page view
   */
  pageView(path: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        path,
        ...properties,
      },
      timestamp: Date.now(),
    };

    this.track(event);
  }

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent | string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = typeof event === 'string' 
      ? { name: event, properties, timestamp: Date.now() }
      : event;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', analyticsEvent);
    }

    // Placeholder: Send to your analytics provider
    // Example implementations:
    
    // Google Analytics 4
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', analyticsEvent.name, analyticsEvent.properties);
    // }

    // Mixpanel
    // if (typeof window !== 'undefined' && (window as any).mixpanel) {
    //   (window as any).mixpanel.track(analyticsEvent.name, analyticsEvent.properties);
    // }

    // Segment
    // if (typeof window !== 'undefined' && (window as any).analytics) {
    //   (window as any).analytics.track(analyticsEvent.name, analyticsEvent.properties);
    // }

    this.queue.push(analyticsEvent);
  }

  /**
   * Track a CTA click
   */
  trackCTA(ctaName: string, location: string, properties?: Record<string, any>) {
    this.track('cta_clicked', {
      cta_name: ctaName,
      location,
      ...properties,
    });
  }

  /**
   * Track a sign up event
   */
  trackSignUp(method: string, properties?: Record<string, any>) {
    this.track('sign_up', {
      method,
      ...properties,
    });
  }

  /**
   * Track a login event
   */
  trackLogin(method: string, properties?: Record<string, any>) {
    this.track('login', {
      method,
      ...properties,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, properties?: Record<string, any>) {
    this.track('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  /**
   * Identify a user (for user-based analytics)
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits);
    }

    // Placeholder: Identify user in your analytics provider
    // Example:
    // if (typeof window !== 'undefined' && (window as any).analytics) {
    //   (window as any).analytics.identify(userId, traits);
    // }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Get queued events (for debugging)
   */
  getQueue(): AnalyticsEvent[] {
    return [...this.queue];
  }

  /**
   * Clear event queue
   */
  clearQueue() {
    this.queue = [];
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export convenience functions
export const trackPageView = (path: string, properties?: Record<string, any>) => 
  analytics.pageView(path, properties);

export const trackEvent = (event: string, properties?: Record<string, any>) => 
  analytics.track(event, properties);

export const trackCTA = (ctaName: string, location: string, properties?: Record<string, any>) => 
  analytics.trackCTA(ctaName, location, properties);

export const trackSignUp = (method: string, properties?: Record<string, any>) => 
  analytics.trackSignUp(method, properties);

export const trackLogin = (method: string, properties?: Record<string, any>) => 
  analytics.trackLogin(method, properties);

export const trackFeature = (featureName: string, properties?: Record<string, any>) => 
  analytics.trackFeature(featureName, properties);

export const identifyUser = (userId: string, traits?: Record<string, any>) => 
  analytics.identify(userId, traits);
