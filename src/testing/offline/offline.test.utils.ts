/**
 * Offline Testing Utilities
 * Provides helper functions for testing offline functionality and PWA capabilities
 */

export interface OfflineTestResult {
  canCacheResources: boolean;
  canWorkOffline: boolean;
  hasServiceWorker: boolean;
  cacheStorage: {
    available: boolean;
    size: number;
    entries: string[];
  };
  localStorage: {
    available: boolean;
    size: number;
    data: { [key: string]: any };
  };
  syncCapabilities: {
    canQueueRequests: boolean;
    canSyncOnReconnect: boolean;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Test service worker registration and functionality
 */
export const testServiceWorker = async (): Promise<{
  registered: boolean;
  active: boolean;
  scope: string;
  updateAvailable: boolean;
}> => {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      active: false,
      scope: '',
      updateAvailable: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      registered: !!registration,
      active: !!(registration?.active),
      scope: registration?.scope || '',
      updateAvailable: !!(registration?.waiting),
    };
  } catch (error) {
    console.error('Service worker test failed:', error);
    return {
      registered: false,
      active: false,
      scope: '',
      updateAvailable: false,
    };
  }
};

/**
 * Test cache storage capabilities
 */
export const testCacheStorage = async (): Promise<{
  available: boolean;
  size: number;
  entries: string[];
  canStore: boolean;
  canRetrieve: boolean;
}> => {
  if (!('caches' in window)) {
    return {
      available: false,
      size: 0,
      entries: [],
      canStore: false,
      canRetrieve: false,
    };
  }

  try {
    const cacheNames = await caches.keys();
    const entries: string[] = [];
    let totalSize = 0;

    // Get entries from all caches
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      requests.forEach(request => {
        entries.push(request.url);
      });
    }

    // Test cache operations
    const testCacheName = 'offline-test-cache';
    const testUrl = '/test-offline-capability';
    const testResponse = new Response('test data');

    let canStore = false;
    let canRetrieve = false;

    try {
      const testCache = await caches.open(testCacheName);
      await testCache.put(testUrl, testResponse.clone());
      canStore = true;

      const retrievedResponse = await testCache.match(testUrl);
      canRetrieve = !!retrievedResponse;

      // Clean up test cache
      await caches.delete(testCacheName);
    } catch (error) {
      console.warn('Cache storage test operations failed:', error);
    }

    return {
      available: true,
      size: totalSize,
      entries,
      canStore,
      canRetrieve,
    };
  } catch (error) {
    console.error('Cache storage test failed:', error);
    return {
      available: false,
      size: 0,
      entries: [],
      canStore: false,
      canRetrieve: false,
    };
  }
};

/**
 * Test local storage persistence
 */
export const testLocalStoragePersistence = (): {
  available: boolean;
  persistent: boolean;
  size: number;
  data: { [key: string]: any };
} => {
  try {
    const testKey = 'offline-test-persistence';
    const testValue = JSON.stringify({ timestamp: Date.now(), test: true });
    
    // Test basic availability
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    const available = retrieved === testValue;

    // Get all current data
    const data: { [key: string]: any } = {};
    let size = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
          size += value.length;
        }
      }
    }

    // Clean up test data
    localStorage.removeItem(testKey);

    // Test persistence (this is limited in testing environment)
    const persistent = available; // Assume persistent if available

    return {
      available,
      persistent,
      size,
      data,
    };
  } catch (error) {
    console.error('Local storage test failed:', error);
    return {
      available: false,
      persistent: false,
      size: 0,
      data: {},
    };
  }
};

/**
 * Test offline detection
 */
export const testOfflineDetection = (): {
  navigatorOnline: boolean;
  canDetectOffline: boolean;
  listenerAttached: boolean;
} => {
  const navigatorOnline = navigator.onLine;
  const canDetectOffline = 'onLine' in navigator;
  
  // Test if offline event listeners can be attached
  let listenerAttached = false;
  try {
    const testListener = () => {};
    window.addEventListener('offline', testListener);
    window.addEventListener('online', testListener);
    listenerAttached = true;
    
    // Clean up
    window.removeEventListener('offline', testListener);
    window.removeEventListener('online', testListener);
  } catch (error) {
    console.warn('Offline event listener test failed:', error);
  }

  return {
    navigatorOnline,
    canDetectOffline,
    listenerAttached,
  };
};

/**
 * Test background sync capabilities
 */
export const testBackgroundSync = async (): Promise<{
  supported: boolean;
  canRegister: boolean;
  tags: string[];
}> => {
  if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    return {
      supported: false,
      canRegister: false,
      tags: [],
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Test sync registration
    let canRegister = false;
    try {
      await registration.sync.register('test-background-sync');
      canRegister = true;
    } catch (error) {
      console.warn('Background sync registration test failed:', error);
    }

    // Get sync tags (this is limited in browser environment)
    const tags: string[] = []; // Would need service worker API to get actual tags

    return {
      supported: true,
      canRegister,
      tags,
    };
  } catch (error) {
    console.error('Background sync test failed:', error);
    return {
      supported: false,
      canRegister: false,
      tags: [],
    };
  }
};

/**
 * Test offline request queuing
 */
export const testOfflineRequestQueuing = (): {
  canQueueRequests: boolean;
  queuedCount: number;
  canReplay: boolean;
} => {
  try {
    const queueKey = 'offline-request-queue';
    const testQueue = [
      { url: '/api/test1', method: 'GET', timestamp: Date.now() },
      { url: '/api/test2', method: 'POST', data: { test: true }, timestamp: Date.now() },
    ];

    // Test queuing capability
    localStorage.setItem(queueKey, JSON.stringify(testQueue));
    const retrieved = localStorage.getItem(queueKey);
    const canQueueRequests = !!retrieved;

    // Count queued requests
    let queuedCount = 0;
    if (retrieved) {
      try {
        const queue = JSON.parse(retrieved);
        queuedCount = Array.isArray(queue) ? queue.length : 0;
      } catch (error) {
        console.warn('Failed to parse request queue:', error);
      }
    }

    // Test replay capability (mock)
    const canReplay = canQueueRequests; // Assume we can replay if we can queue

    // Clean up test data
    localStorage.removeItem(queueKey);

    return {
      canQueueRequests,
      queuedCount,
      canReplay,
    };
  } catch (error) {
    console.error('Offline request queuing test failed:', error);
    return {
      canQueueRequests: false,
      queuedCount: 0,
      canReplay: false,
    };
  }
};

/**
 * Test PWA manifest and installation
 */
export const testPWACapabilities = (): {
  hasManifest: boolean;
  manifestData: any;
  isInstallable: boolean;
  isInstalled: boolean;
} => {
  // Check for manifest
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  const hasManifest = !!manifestLink;

  let manifestData = null;
  if (hasManifest && manifestLink.href) {
    // In a real test, you'd fetch and parse the manifest
    manifestData = { href: manifestLink.href };
  }

  // Check installation status
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     window.matchMedia('(display-mode: fullscreen)').matches;

  // Check if installable (this is simplified)
  const isInstallable = hasManifest && 'serviceWorker' in navigator;

  return {
    hasManifest,
    manifestData,
    isInstallable,
    isInstalled,
  };
};

/**
 * Simulate offline mode for testing
 */
export const simulateOfflineMode = (enable: boolean = true): void => {
  if (enable) {
    // Override navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Dispatch offline event
    window.dispatchEvent(new Event('offline'));
  } else {
    // Restore online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Dispatch online event
    window.dispatchEvent(new Event('online'));
  }
};

/**
 * Test specific offline scenarios
 */
export const testOfflineScenarios = async (): Promise<{
  scenarios: Array<{
    name: string;
    success: boolean;
    error?: string;
  }>;
}> => {
  const scenarios = [
    {
      name: 'Load cached pages',
      test: async () => {
        const cache = await testCacheStorage();
        return cache.available && cache.canRetrieve;
      },
    },
    {
      name: 'Save data locally',
      test: async () => {
        const storage = testLocalStoragePersistence();
        return storage.available;
      },
    },
    {
      name: 'Queue offline requests',
      test: async () => {
        const queue = testOfflineRequestQueuing();
        return queue.canQueueRequests;
      },
    },
    {
      name: 'Detect network status',
      test: async () => {
        const detection = testOfflineDetection();
        return detection.canDetectOffline;
      },
    },
    {
      name: 'Service worker active',
      test: async () => {
        const sw = await testServiceWorker();
        return sw.registered && sw.active;
      },
    },
  ];

  const results = [];

  for (const scenario of scenarios) {
    try {
      const success = await scenario.test();
      results.push({
        name: scenario.name,
        success,
      });
    } catch (error) {
      results.push({
        name: scenario.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { scenarios: results };
};

/**
 * Generate comprehensive offline functionality report
 */
export const generateOfflineReport = async (): Promise<OfflineTestResult> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Test all offline capabilities
  const serviceWorker = await testServiceWorker();
  const cacheStorage = await testCacheStorage();
  const localStorage = testLocalStoragePersistence();
  const offlineDetection = testOfflineDetection();
  const backgroundSync = await testBackgroundSync();
  const requestQueue = testOfflineRequestQueuing();
  const pwaCapabilities = testPWACapabilities();
  const scenarios = await testOfflineScenarios();

  // Analyze results and generate issues/recommendations
  if (!serviceWorker.registered) {
    issues.push('Service worker not registered');
    recommendations.push('Register a service worker for offline functionality');
  }

  if (!serviceWorker.active && serviceWorker.registered) {
    issues.push('Service worker registered but not active');
    recommendations.push('Ensure service worker activates properly');
  }

  if (!cacheStorage.available) {
    issues.push('Cache storage not available');
    recommendations.push('Implement cache storage for offline content');
  }

  if (!cacheStorage.canStore || !cacheStorage.canRetrieve) {
    issues.push('Cache storage operations failing');
    recommendations.push('Fix cache storage read/write operations');
  }

  if (!localStorage.available) {
    issues.push('Local storage not available');
    recommendations.push('Ensure local storage is available for data persistence');
  }

  if (!offlineDetection.canDetectOffline) {
    issues.push('Cannot detect offline status');
    recommendations.push('Implement offline detection using navigator.onLine and events');
  }

  if (!backgroundSync.supported) {
    issues.push('Background sync not supported');
    recommendations.push('Consider polyfill for background sync or alternative sync strategy');
  }

  if (!requestQueue.canQueueRequests) {
    issues.push('Cannot queue offline requests');
    recommendations.push('Implement request queuing for offline scenarios');
  }

  if (!pwaCapabilities.hasManifest) {
    issues.push('PWA manifest missing');
    recommendations.push('Add PWA manifest for better offline experience');
  }

  // Check scenario results
  scenarios.scenarios.forEach(scenario => {
    if (!scenario.success) {
      issues.push(`Offline scenario failed: ${scenario.name}`);
      if (scenario.error) {
        issues.push(`Error: ${scenario.error}`);
      }
    }
  });

  return {
    canCacheResources: cacheStorage.available && cacheStorage.canStore,
    canWorkOffline: serviceWorker.active && cacheStorage.canRetrieve,
    hasServiceWorker: serviceWorker.registered && serviceWorker.active,
    cacheStorage: {
      available: cacheStorage.available,
      size: cacheStorage.size,
      entries: cacheStorage.entries,
    },
    localStorage: {
      available: localStorage.available,
      size: localStorage.size,
      data: localStorage.data,
    },
    syncCapabilities: {
      canQueueRequests: requestQueue.canQueueRequests,
      canSyncOnReconnect: backgroundSync.canRegister,
    },
    issues,
    recommendations,
  };
};