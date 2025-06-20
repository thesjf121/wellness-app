/**
 * Device Testing Utilities
 * Provides helper functions for testing across different devices, screen sizes, and platforms
 */

export interface DeviceTestConfiguration {
  name: string;
  width: number;
  height: number;
  userAgent: string;
  platform: 'ios' | 'android' | 'desktop' | 'tablet';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  touchEnabled: boolean;
}

export interface ResponsiveTestResult {
  device: string;
  passed: boolean;
  issues: string[];
  layout: {
    overflowIssues: boolean;
    textReadability: boolean;
    touchTargetSize: boolean;
    navigationUsable: boolean;
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
  };
}

// Device configurations for testing
export const DEVICE_CONFIGURATIONS: DeviceTestConfiguration[] = [
  // Mobile Devices
  {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platform: 'ios',
    orientation: 'portrait',
    pixelRatio: 2,
    touchEnabled: true,
  },
  {
    name: 'iPhone 12',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platform: 'ios',
    orientation: 'portrait',
    pixelRatio: 3,
    touchEnabled: true,
  },
  {
    name: 'iPhone 12 Landscape',
    width: 844,
    height: 390,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platform: 'ios',
    orientation: 'landscape',
    pixelRatio: 3,
    touchEnabled: true,
  },
  {
    name: 'Samsung Galaxy S21',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    platform: 'android',
    orientation: 'portrait',
    pixelRatio: 3,
    touchEnabled: true,
  },
  {
    name: 'Google Pixel 5',
    width: 393,
    height: 851,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    platform: 'android',
    orientation: 'portrait',
    pixelRatio: 3,
    touchEnabled: true,
  },
  
  // Tablets
  {
    name: 'iPad',
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platform: 'ios',
    orientation: 'portrait',
    pixelRatio: 2,
    touchEnabled: true,
  },
  {
    name: 'iPad Landscape',
    width: 1024,
    height: 768,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platform: 'ios',
    orientation: 'landscape',
    pixelRatio: 2,
    touchEnabled: true,
  },
  {
    name: 'Samsung Galaxy Tab',
    width: 800,
    height: 1280,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    platform: 'android',
    orientation: 'portrait',
    pixelRatio: 2,
    touchEnabled: true,
  },
  
  // Desktop
  {
    name: 'Desktop 1920x1080',
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    platform: 'desktop',
    orientation: 'landscape',
    pixelRatio: 1,
    touchEnabled: false,
  },
  {
    name: 'Desktop 1366x768',
    width: 1366,
    height: 768,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    platform: 'desktop',
    orientation: 'landscape',
    pixelRatio: 1,
    touchEnabled: false,
  },
  {
    name: 'MacBook Pro',
    width: 1440,
    height: 900,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    platform: 'desktop',
    orientation: 'landscape',
    pixelRatio: 2,
    touchEnabled: false,
  },
];

/**
 * Set up device simulation
 */
export const simulateDevice = (config: DeviceTestConfiguration): void => {
  // Set viewport
  if (window.innerWidth !== config.width || window.innerHeight !== config.height) {
    // In a real browser environment, this would require browser automation tools
    // For testing, we simulate by setting CSS viewport
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      viewport.content = `width=${config.width}, height=${config.height}, initial-scale=1.0`;
    }
  }

  // Mock user agent
  Object.defineProperty(navigator, 'userAgent', {
    value: config.userAgent,
    configurable: true,
  });

  // Mock pixel ratio
  Object.defineProperty(window, 'devicePixelRatio', {
    value: config.pixelRatio,
    configurable: true,
  });

  // Mock touch capabilities
  if (config.touchEnabled) {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });
  } else {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
  }

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

/**
 * Test responsive layout on a specific device
 */
export const testResponsiveLayout = async (
  config: DeviceTestConfiguration,
  container: HTMLElement = document.body
): Promise<ResponsiveTestResult> => {
  const issues: string[] = [];
  const startTime = performance.now();

  // Simulate device
  simulateDevice(config);

  // Wait for layout to settle
  await new Promise(resolve => requestAnimationFrame(resolve));

  // Test layout issues
  const layoutTests = {
    overflowIssues: testOverflowIssues(container),
    textReadability: testTextReadability(container, config),
    touchTargetSize: testTouchTargetSizes(container, config),
    navigationUsable: testNavigationUsability(container, config),
  };

  // Collect issues
  Object.entries(layoutTests).forEach(([test, result]) => {
    if (!result.passed) {
      issues.push(...result.issues);
    }
  });

  // Measure performance
  const renderTime = performance.now() - startTime;
  const memoryUsage = (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0;

  return {
    device: config.name,
    passed: issues.length === 0,
    issues,
    layout: {
      overflowIssues: layoutTests.overflowIssues.passed,
      textReadability: layoutTests.textReadability.passed,
      touchTargetSize: layoutTests.touchTargetSize.passed,
      navigationUsable: layoutTests.navigationUsable.passed,
    },
    performance: {
      renderTime,
      memoryUsage,
    },
  };
};

/**
 * Test for overflow issues
 */
const testOverflowIssues = (container: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for horizontal overflow
  if (container.scrollWidth > container.clientWidth) {
    issues.push('Horizontal overflow detected');
  }

  // Check for elements extending beyond viewport
  const elements = container.querySelectorAll('*');
  elements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      issues.push(`Element at index ${index} extends beyond viewport width`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test text readability
 */
const testTextReadability = (
  container: HTMLElement,
  config: DeviceTestConfiguration
): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  const minFontSize = config.platform === 'desktop' ? 14 : 16; // Minimum readable font size

  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, textarea');
  
  textElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    const fontSize = parseInt(styles.fontSize);
    
    if (fontSize < minFontSize) {
      issues.push(`Text element at index ${index} has font size ${fontSize}px (min: ${minFontSize}px)`);
    }

    // Check line height for readability
    const lineHeight = parseFloat(styles.lineHeight);
    if (lineHeight < fontSize * 1.2) {
      issues.push(`Text element at index ${index} has inadequate line height`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test touch target sizes
 */
const testTouchTargetSizes = (
  container: HTMLElement,
  config: DeviceTestConfiguration
): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!config.touchEnabled) {
    return { passed: true, issues: [] }; // Skip for non-touch devices
  }

  const minSize = 44; // 44px minimum for accessibility
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');

  interactiveElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    
    if (rect.width < minSize || rect.height < minSize) {
      issues.push(`Touch target at index ${index} is too small (${Math.round(rect.width)}x${Math.round(rect.height)}px, min: ${minSize}x${minSize}px)`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test navigation usability
 */
const testNavigationUsability = (
  container: HTMLElement,
  config: DeviceTestConfiguration
): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Test mobile navigation
  if (config.platform === 'ios' || config.platform === 'android') {
    const nav = container.querySelector('nav');
    if (nav) {
      const rect = nav.getBoundingClientRect();
      
      // Navigation should be easily accessible on mobile
      if (rect.height > window.innerHeight * 0.5) {
        issues.push('Navigation takes up too much screen space on mobile');
      }
    }

    // Check for hamburger menu or mobile-friendly navigation
    const hamburger = container.querySelector('.hamburger, .mobile-menu-button, [aria-label*="menu"]');
    const mobileNav = container.querySelector('.mobile-nav, .mobile-menu');
    
    if (!hamburger && !mobileNav && config.width < 768) {
      issues.push('No mobile navigation pattern detected for small screen');
    }
  }

  // Test desktop navigation
  if (config.platform === 'desktop') {
    const nav = container.querySelector('nav');
    if (nav) {
      const links = nav.querySelectorAll('a, button');
      if (links.length === 0) {
        issues.push('Navigation has no interactive elements');
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test specific iOS functionality
 */
export const testIOSSpecific = (container: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Test for iOS-specific viewport issues
  const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!viewport || !viewport.content.includes('viewport-fit=cover')) {
    issues.push('Missing viewport-fit=cover for iOS safe areas');
  }

  // Test for iOS PWA capabilities
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) {
    // Check for iOS-specific meta tags
    const appleMobileWebApp = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebApp) {
      issues.push('Missing apple-mobile-web-app-capable meta tag for iOS PWA');
    }

    const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      issues.push('Missing apple-mobile-web-app-status-bar-style meta tag');
    }
  }

  // Test for iOS bounce scroll behavior
  const scrollableElements = container.querySelectorAll('[style*="overflow"], .scroll');
  scrollableElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    if ((styles as any).webkitOverflowScrolling !== 'touch') {
      issues.push(`Scrollable element at index ${index} missing -webkit-overflow-scrolling: touch`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test specific Android functionality
 */
export const testAndroidSpecific = (container: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Test for Android theme color
  const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!themeColor) {
    issues.push('Missing theme-color meta tag for Android');
  }

  // Test for proper form handling on Android
  const inputs = container.querySelectorAll('input');
  inputs.forEach((input, index) => {
    const inputMode = input.getAttribute('inputmode');
    const type = input.type;
    
    // Check for appropriate input modes
    if (type === 'tel' && !inputMode) {
      issues.push(`Phone input at index ${index} should have inputmode="tel"`);
    }
    if (type === 'email' && !inputMode) {
      issues.push(`Email input at index ${index} should have inputmode="email"`);
    }
    if (type === 'number' && !inputMode) {
      issues.push(`Number input at index ${index} should have inputmode="numeric"`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test orientation handling
 */
export const testOrientationHandling = async (container: HTMLElement): Promise<{
  supportsOrientation: boolean;
  layoutAdaptsToOrientation: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];
  
  const supportsOrientation = 'orientation' in window || 'orientation' in screen;
  
  if (!supportsOrientation) {
    issues.push('Orientation API not supported');
  }

  // Test orientation change handling
  let layoutAdaptsToOrientation = false;
  
  try {
    // Simulate orientation change
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Mock orientation change
    Object.defineProperty(window, 'innerWidth', { value: originalHeight, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalWidth, configurable: true });
    
    window.dispatchEvent(new Event('orientationchange'));
    window.dispatchEvent(new Event('resize'));
    
    // Wait for potential layout changes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if layout adapted (simplified check)
    const nav = container.querySelector('nav');
    if (nav) {
      const navRect = nav.getBoundingClientRect();
      layoutAdaptsToOrientation = navRect.width > 0 && navRect.height > 0;
    } else {
      layoutAdaptsToOrientation = true; // Assume it adapts if no nav to test
    }
    
    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
  } catch (error) {
    issues.push('Error testing orientation handling');
  }

  return {
    supportsOrientation,
    layoutAdaptsToOrientation,
    issues,
  };
};

/**
 * Run comprehensive device testing across all configurations
 */
export const runDeviceTestSuite = async (
  container: HTMLElement = document.body
): Promise<{
  results: ResponsiveTestResult[];
  summary: {
    totalDevices: number;
    passedDevices: number;
    failedDevices: number;
    commonIssues: string[];
  };
}> => {
  const results: ResponsiveTestResult[] = [];
  const allIssues: string[] = [];

  // Test each device configuration
  for (const config of DEVICE_CONFIGURATIONS) {
    const result = await testResponsiveLayout(config, container);
    results.push(result);
    allIssues.push(...result.issues);
  }

  // Test platform-specific functionality
  const iosResults = testIOSSpecific(container);
  const androidResults = testAndroidSpecific(container);
  const orientationResults = await testOrientationHandling(container);

  // Add platform-specific issues to overall results
  allIssues.push(...iosResults.issues, ...androidResults.issues, ...orientationResults.issues);

  // Calculate summary
  const passedDevices = results.filter(r => r.passed).length;
  const failedDevices = results.length - passedDevices;

  // Find common issues (appearing in multiple device tests)
  const issueCount: { [key: string]: number } = {};
  allIssues.forEach(issue => {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  });

  const commonIssues = Object.entries(issueCount)
    .filter(([, count]) => count > 1)
    .map(([issue]) => issue);

  return {
    results,
    summary: {
      totalDevices: results.length,
      passedDevices,
      failedDevices,
      commonIssues,
    },
  };
};