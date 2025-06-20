/**
 * Performance Testing Utilities
 * Provides helper functions for testing application performance and optimization
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  bundleSize?: number;
  interactionTime?: number;
}

export interface PerformanceThresholds {
  loadTime: number; // ms
  renderTime: number; // ms
  memoryUsage: number; // MB
  maxNetworkRequests: number;
  maxBundleSize?: number; // KB
}

// Default performance thresholds for a wellness app
export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  loadTime: 3000, // 3 seconds
  renderTime: 1000, // 1 second
  memoryUsage: 50, // 50 MB
  maxNetworkRequests: 20,
  maxBundleSize: 1024, // 1 MB
};

/**
 * Measure page load performance
 */
export const measureLoadPerformance = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Estimate memory usage
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0;
      
      // Count network requests
      const networkRequests = performance.getEntriesByType('resource').length;
      
      resolve({
        loadTime,
        renderTime,
        memoryUsage,
        networkRequests,
      });
    });
  });
};

/**
 * Measure component render performance
 */
export const measureRenderPerformance = async (
  renderFunction: () => Promise<void> | void
): Promise<number> => {
  const start = performance.now();
  
  await renderFunction();
  
  // Wait for next frame to ensure rendering is complete
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  const end = performance.now();
  return end - start;
};

/**
 * Measure interaction performance (time to interactive)
 */
export const measureInteractionPerformance = (
  element: HTMLElement,
  action: () => void
): Promise<number> => {
  return new Promise((resolve) => {
    const start = performance.now();
    
    const handleInteraction = () => {
      const end = performance.now();
      element.removeEventListener('click', handleInteraction);
      resolve(end - start);
    };
    
    element.addEventListener('click', handleInteraction);
    action();
  });
};

/**
 * Monitor memory usage over time
 */
export const monitorMemoryUsage = (
  duration: number = 10000,
  interval: number = 1000
): Promise<number[]> => {
  return new Promise((resolve) => {
    const measurements: number[] = [];
    const memoryInfo = (performance as any).memory;
    
    if (!memoryInfo) {
      resolve([]);
      return;
    }
    
    const measureInterval = setInterval(() => {
      const usage = memoryInfo.usedJSHeapSize / (1024 * 1024);
      measurements.push(usage);
    }, interval);
    
    setTimeout(() => {
      clearInterval(measureInterval);
      resolve(measurements);
    }, duration);
  });
};

/**
 * Analyze bundle size and loading performance
 */
export const analyzeBundlePerformance = async (): Promise<{
  totalSize: number;
  mainBundle: number;
  chunks: Array<{ name: string; size: number }>;
}> => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  let totalSize = 0;
  let mainBundle = 0;
  const chunks: Array<{ name: string; size: number }> = [];
  
  resources.forEach(resource => {
    if (resource.name.includes('.js') || resource.name.includes('.css')) {
      const size = resource.transferSize || 0;
      totalSize += size;
      
      if (resource.name.includes('main.')) {
        mainBundle = size;
      } else {
        chunks.push({
          name: resource.name.split('/').pop() || 'unknown',
          size,
        });
      }
    }
  });
  
  return {
    totalSize: totalSize / 1024, // Convert to KB
    mainBundle: mainBundle / 1024,
    chunks: chunks.map(chunk => ({
      ...chunk,
      size: chunk.size / 1024,
    })),
  };
};

/**
 * Test image loading performance
 */
export const testImageLoadingPerformance = (imageUrls: string[]): Promise<{
  totalTime: number;
  averageTime: number;
  failures: string[];
}> => {
  const startTime = performance.now();
  const failures: string[] = [];
  
  const imagePromises = imageUrls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve();
      img.onerror = () => {
        failures.push(url);
        resolve();
      };
      
      img.src = url;
    });
  });
  
  return Promise.all(imagePromises).then(() => {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    return {
      totalTime,
      averageTime: totalTime / imageUrls.length,
      failures,
    };
  });
};

/**
 * Test API response times
 */
export const testAPIPerformance = async (endpoints: string[]): Promise<{
  results: Array<{ endpoint: string; responseTime: number; status: number }>;
  averageResponseTime: number;
}> => {
  const results = [];
  
  for (const endpoint of endpoints) {
    const start = performance.now();
    
    try {
      const response = await fetch(endpoint);
      const end = performance.now();
      
      results.push({
        endpoint,
        responseTime: end - start,
        status: response.status,
      });
    } catch (error) {
      const end = performance.now();
      results.push({
        endpoint,
        responseTime: end - start,
        status: 0, // Error
      });
    }
  }
  
  const averageResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0) / results.length;
  
  return { results, averageResponseTime };
};

/**
 * Test scroll performance
 */
export const testScrollPerformance = (element: HTMLElement, scrollDistance: number = 1000): Promise<{
  frameDrops: number;
  averageFPS: number;
  totalTime: number;
}> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    let frameDrops = 0;
    let lastFrameTime = performance.now();
    const startTime = performance.now();
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const frameDuration = currentTime - lastFrameTime;
      
      frameCount++;
      
      // Consider frames longer than 16.67ms (60fps) as drops
      if (frameDuration > 16.67) {
        frameDrops++;
      }
      
      lastFrameTime = currentTime;
      
      if (element.scrollTop < scrollDistance) {
        element.scrollTop += 10;
        requestAnimationFrame(measureFrame);
      } else {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const averageFPS = (frameCount / totalTime) * 1000;
        
        resolve({
          frameDrops,
          averageFPS,
          totalTime,
        });
      }
    };
    
    requestAnimationFrame(measureFrame);
  });
};

/**
 * Generate performance report
 */
export const generatePerformanceReport = async (
  thresholds: PerformanceThresholds = DEFAULT_PERFORMANCE_THRESHOLDS
): Promise<{
  score: number;
  metrics: PerformanceMetrics;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Measure current performance
  const metrics = await measureLoadPerformance();
  
  // Bundle analysis
  const bundleAnalysis = await analyzeBundlePerformance();
  metrics.bundleSize = bundleAnalysis.totalSize;
  
  // Check against thresholds
  if (metrics.loadTime > thresholds.loadTime) {
    issues.push(`Load time (${metrics.loadTime.toFixed(0)}ms) exceeds threshold (${thresholds.loadTime}ms)`);
    recommendations.push('Optimize bundle size, enable code splitting, use lazy loading');
  }
  
  if (metrics.renderTime > thresholds.renderTime) {
    issues.push(`Render time (${metrics.renderTime.toFixed(0)}ms) exceeds threshold (${thresholds.renderTime}ms)`);
    recommendations.push('Optimize React components, reduce DOM complexity, use React.memo');
  }
  
  if (metrics.memoryUsage > thresholds.memoryUsage) {
    issues.push(`Memory usage (${metrics.memoryUsage.toFixed(1)}MB) exceeds threshold (${thresholds.memoryUsage}MB)`);
    recommendations.push('Fix memory leaks, optimize images, clean up event listeners');
  }
  
  if (metrics.networkRequests > thresholds.maxNetworkRequests) {
    issues.push(`Network requests (${metrics.networkRequests}) exceed threshold (${thresholds.maxNetworkRequests})`);
    recommendations.push('Combine API calls, implement request caching, use service workers');
  }
  
  if (metrics.bundleSize && thresholds.maxBundleSize && metrics.bundleSize > thresholds.maxBundleSize) {
    issues.push(`Bundle size (${metrics.bundleSize.toFixed(1)}KB) exceeds threshold (${thresholds.maxBundleSize}KB)`);
    recommendations.push('Enable tree shaking, remove unused dependencies, implement code splitting');
  }
  
  // Calculate performance score (0-100)
  let score = 100;
  
  // Deduct points for each issue
  const loadTimeScore = Math.max(0, 25 - (metrics.loadTime / thresholds.loadTime) * 25);
  const renderTimeScore = Math.max(0, 25 - (metrics.renderTime / thresholds.renderTime) * 25);
  const memoryScore = Math.max(0, 25 - (metrics.memoryUsage / thresholds.memoryUsage) * 25);
  const networkScore = Math.max(0, 25 - (metrics.networkRequests / thresholds.maxNetworkRequests) * 25);
  
  score = loadTimeScore + renderTimeScore + memoryScore + networkScore;
  
  return {
    score: Math.round(score),
    metrics,
    issues,
    recommendations,
  };
};

/**
 * Test component performance under load
 */
export const stressTestComponent = async (
  renderComponent: () => Promise<void>,
  iterations: number = 100
): Promise<{
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  memoryLeak: boolean;
}> => {
  const renderTimes: number[] = [];
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  for (let i = 0; i < iterations; i++) {
    const renderTime = await measureRenderPerformance(renderComponent);
    renderTimes.push(renderTime);
    
    // Force garbage collection if available (dev tools)
    if ((window as any).gc) {
      (window as any).gc();
    }
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
  
  return {
    averageRenderTime: renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
    maxRenderTime: Math.max(...renderTimes),
    minRenderTime: Math.min(...renderTimes),
    memoryLeak: memoryIncrease > 10, // Consider 10MB+ increase as potential leak
  };
};

/**
 * Monitor real user metrics (RUM)
 */
export const collectRealUserMetrics = (): {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
} => {
  const paint = performance.getEntriesByType('paint');
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const FCP = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
  
  // LCP would need PerformanceObserver in a real implementation
  const LCP = 0; // Placeholder
  
  // FID would need PerformanceObserver in a real implementation
  const FID = 0; // Placeholder
  
  // CLS would need PerformanceObserver in a real implementation
  const CLS = 0; // Placeholder
  
  return { FCP, LCP, FID, CLS };
};