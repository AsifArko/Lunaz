import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

type AnalyticsEventType =
  | 'pageview'
  | 'session_start'
  | 'session_end'
  | 'click'
  | 'scroll'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'purchase'
  | 'search'
  | 'error'
  | 'custom';

interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  page: {
    url: string;
    path: string;
    hostname: string;
    title?: string;
    search?: string;
    hash?: string;
  };
  referrer?: { url?: string };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  event?: {
    name: string;
    properties?: Record<string, unknown>;
  };
  device?: {
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    touchEnabled?: boolean;
    language?: string;
  };
}

interface PerformanceData {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

interface AnalyticsContextType {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackProductView: (productId: string, productName: string) => void;
  trackAddToCart: (productId: string, quantity: number, price: number) => void;
  trackRemoveFromCart: (productId: string) => void;
  trackCheckoutStart: (cartValue: number) => void;
  trackPurchase: (orderId: string, total: number, items: Array<{ productId: string; total: number }>) => void;
  trackSearch: (query: string, resultsCount: number) => void;
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

// Generate or retrieve visitor ID
function getVisitorId(): string {
  let visitorId = localStorage.getItem('lunaz_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('lunaz_visitor_id', visitorId);
  }
  return visitorId;
}

// Generate session ID (new session after 30 min of inactivity)
function getSessionId(): string {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();
  
  const stored = sessionStorage.getItem('lunaz_session');
  if (stored) {
    const { id, lastActivity } = JSON.parse(stored);
    if (now - lastActivity < SESSION_TIMEOUT) {
      // Update last activity
      sessionStorage.setItem('lunaz_session', JSON.stringify({ id, lastActivity: now }));
      return id;
    }
  }
  
  // New session
  const newId = 's_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessionStorage.setItem('lunaz_session', JSON.stringify({ id: newId, lastActivity: now }));
  return newId;
}

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> | undefined {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const param of utmParams) {
    const value = params.get(param);
    if (value) {
      utm[param.replace('utm_', '')] = value;
    }
  }
  
  return Object.keys(utm).length > 0 ? utm : undefined;
}

// Get current page data
function getPageData() {
  return {
    url: window.location.href,
    path: window.location.pathname,
    hostname: window.location.hostname,
    title: document.title,
    search: window.location.search || undefined,
    hash: window.location.hash || undefined,
  };
}

// Get device data
function getDeviceData() {
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    touchEnabled: 'ontouchstart' in window,
    language: navigator.language,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Context                                       */
/* -------------------------------------------------------------------------- */

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { token } = useAuth();
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNewSessionRef = useRef(true);
  const lastPathRef = useRef<string | null>(null);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/analytics/collect`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          events,
        }),
        keepalive: true, // Use beacon-like behavior
      });
    } catch (err) {
      // Silently fail - don't break user experience
      console.warn('Analytics collection failed:', err);
    }
  }, [token]);

  // Queue an event
  const queueEvent = useCallback((event: AnalyticsEvent) => {
    eventQueueRef.current.push(event);

    // Clear existing timeout
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }

    // Flush after 2 seconds or when batch reaches 10 events
    if (eventQueueRef.current.length >= 10) {
      flushEvents();
    } else {
      flushTimeoutRef.current = setTimeout(flushEvents, 2000);
    }
  }, [flushEvents]);

  // Create base event
  const createEvent = useCallback((type: AnalyticsEventType, eventData?: { name: string; properties?: Record<string, unknown> }): AnalyticsEvent => {
    return {
      type,
      timestamp: new Date().toISOString(),
      page: getPageData(),
      referrer: document.referrer ? { url: document.referrer } : undefined,
      utm: getUTMParams(),
      event: eventData,
      device: getDeviceData(),
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Skip if same path (e.g., query param change only)
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;

    // Track session start on first page view
    if (isNewSessionRef.current) {
      queueEvent(createEvent('session_start'));
      isNewSessionRef.current = false;
    }

    // Track page view
    queueEvent(createEvent('pageview'));
  }, [location.pathname, queueEvent, createEvent]);

  // Track performance metrics
  useEffect(() => {
    let sent = false;
    const metrics: PerformanceData = {};
    
    const sendPerformanceData = () => {
      if (sent) return;
      sent = true;
      
      // Always get navigation timing data
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navigation) {
        metrics.ttfb = Math.max(0, navigation.responseStart - navigation.requestStart);
        metrics.fcp = navigation.responseStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
        metrics.loadComplete = navigation.loadEventEnd - navigation.startTime;
      }
      
      // Only send if we have at least some metrics
      if (Object.keys(metrics).length === 0) return;
      
      fetch(`${API_URL}/analytics/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          page: getPageData(),
          metrics,
          connection: (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection
            ? {
                effectiveType: (navigator as Navigator & { connection: { effectiveType?: string } }).connection.effectiveType,
                downlink: (navigator as Navigator & { connection: { downlink?: number } }).connection.downlink,
                rtt: (navigator as Navigator & { connection: { rtt?: number } }).connection.rtt,
              }
            : undefined,
          device: getDeviceData(),
        }),
        keepalive: true,
      }).catch(() => {
        // Silently fail
      });
    };
    
    // Wait for page to be fully loaded
    const trackPerformance = () => {
      // Get LCP from buffered entries
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lastEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & { startTime: number };
          metrics.lcp = lastEntry.startTime;
        }
      } catch {
        // Try observer approach
      }
      
      // Observe LCP for future entries
      if (typeof PerformanceObserver !== 'undefined') {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
            if (lastEntry) {
              metrics.lcp = lastEntry.startTime;
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          // Not supported
        }

        // Observe FID
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const firstEntry = entries[0] as PerformanceEntry & { processingStart: number; startTime: number };
            if (firstEntry) {
              metrics.fid = firstEntry.processingStart - firstEntry.startTime;
            }
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch {
          // Not supported
        }

        // Observe CLS
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
              if (!layoutShift.hadRecentInput) {
                clsValue += layoutShift.value;
              }
            }
            metrics.cls = clsValue;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // Not supported
        }
      }

      // Send performance data after 3 seconds
      setTimeout(sendPerformanceData, 3000);
    };

    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
      return () => window.removeEventListener('load', trackPerformance);
    }
  }, []);

  // Flush events on page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushEvents();
      }
    };

    const handleBeforeUnload = () => {
      queueEvent(createEvent('session_end'));
      flushEvents();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushEvents, queueEvent, createEvent]);

  // Public tracking methods
  const trackEvent = useCallback((name: string, properties?: Record<string, unknown>) => {
    queueEvent(createEvent('custom', { name, properties }));
  }, [queueEvent, createEvent]);

  const trackProductView = useCallback((productId: string, productName: string) => {
    queueEvent(createEvent('product_view', { name: 'product_view', properties: { productId, productName } }));
  }, [queueEvent, createEvent]);

  const trackAddToCart = useCallback((productId: string, quantity: number, price: number) => {
    queueEvent(createEvent('add_to_cart', { name: 'add_to_cart', properties: { productId, quantity, price } }));
  }, [queueEvent, createEvent]);

  const trackRemoveFromCart = useCallback((productId: string) => {
    queueEvent(createEvent('remove_from_cart', { name: 'remove_from_cart', properties: { productId } }));
  }, [queueEvent, createEvent]);

  const trackCheckoutStart = useCallback((cartValue: number) => {
    queueEvent(createEvent('checkout_start', { name: 'checkout_start', properties: { cartValue } }));
  }, [queueEvent, createEvent]);

  const trackPurchase = useCallback((orderId: string, total: number, items: Array<{ productId: string; total: number }>) => {
    queueEvent(createEvent('purchase', { name: 'purchase', properties: { orderId, total, items } }));
  }, [queueEvent, createEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    queueEvent(createEvent('search', { name: 'search', properties: { query, resultsCount } }));
  }, [queueEvent, createEvent]);

  const value: AnalyticsContextType = {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackPurchase,
    trackSearch,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
