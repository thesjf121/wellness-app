/**
 * Accessibility Testing Utilities
 * Provides helper functions for testing WCAG 2.1 compliance and accessibility features
 */

import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

export interface AccessibilityReport {
  score: number;
  violations: AccessibilityViolation[];
  passes: number;
  violations_count: number;
  wcag_level: 'AA' | 'AAA';
  recommendations: string[];
}

// WCAG 2.1 Guidelines for testing
export const WCAG_GUIDELINES = {
  // Level A
  A: [
    'color-contrast',
    'keyboard',
    'focus-order-semantics',
    'bypass',
    'page-has-heading-one',
    'landmark-one-main',
    'region',
  ],
  // Level AA
  AA: [
    'color-contrast-enhanced',
    'resize-text',
    'images-of-text',
    'focus-visible',
    'label',
    'link-name',
  ],
  // Level AAA
  AAA: [
    'color-contrast-enhanced',
    'context-menu',
    'focus-visible-enhanced',
  ],
};

/**
 * Run comprehensive accessibility audit using axe-core
 */
export const runAccessibilityAudit = async (
  element: HTMLElement = document.body,
  options: {
    level?: 'A' | 'AA' | 'AAA';
    tags?: string[];
    rules?: { [key: string]: { enabled: boolean } };
  } = {}
): Promise<AccessibilityReport> => {
  const { level = 'AA', tags = [], rules = {} } = options;
  
  // Configure axe based on WCAG level
  const config = {
    tags: [`wcag2${level.toLowerCase()}`, ...tags],
    rules: {
      // Enable specific rules based on level
      'color-contrast': { enabled: true },
      'keyboard': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'label': { enabled: true },
      'link-name': { enabled: true },
      'bypass': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'landmark-one-main': { enabled: true },
      'region': { enabled: true },
      ...rules,
    },
  };

  try {
    const results = await axe(element, config);
    
    const violations: AccessibilityViolation[] = results.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
      })),
    }));

    // Calculate accessibility score (0-100)
    const totalChecks = results.passes.length + results.violations.length;
    const score = totalChecks > 0 ? Math.round((results.passes.length / totalChecks) * 100) : 100;

    const recommendations = generateAccessibilityRecommendations(violations);

    return {
      score,
      violations,
      passes: results.passes.length,
      violations_count: results.violations.length,
      wcag_level: level,
      recommendations,
    };
  } catch (error) {
    console.error('Accessibility audit failed:', error);
    return {
      score: 0,
      violations: [],
      passes: 0,
      violations_count: 0,
      wcag_level: level,
      recommendations: ['Unable to run accessibility audit'],
    };
  }
};

/**
 * Test keyboard navigation
 */
export const testKeyboardNavigation = (container: HTMLElement): {
  focusableElements: number;
  focusTraps: number;
  missingFocusIndicators: number;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Find all focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];
  
  const focusableElements = container.querySelectorAll(focusableSelectors.join(', '));
  let focusTraps = 0;
  let missingFocusIndicators = 0;

  focusableElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    
    // Test focus visibility
    htmlElement.focus();
    const styles = window.getComputedStyle(htmlElement, ':focus');
    const hasFocusIndicator = 
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      styles.border !== htmlElement.style.border;
    
    if (!hasFocusIndicator) {
      missingFocusIndicators++;
      issues.push(`Element at index ${index} lacks visible focus indicator`);
    }
    
    // Test tab order
    const tabIndex = htmlElement.tabIndex;
    if (tabIndex > 0) {
      focusTraps++;
      issues.push(`Element at index ${index} has positive tabindex (${tabIndex}), which can create focus traps`);
    }
  });

  return {
    focusableElements: focusableElements.length,
    focusTraps,
    missingFocusIndicators,
    issues,
  };
};

/**
 * Test color contrast ratios
 */
export const testColorContrast = (element: HTMLElement): {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
} => {
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;
  
  // This is a simplified contrast calculation
  // In a real implementation, you'd use a proper color contrast library
  const ratio = calculateContrastRatio(color, backgroundColor);
  
  let level: 'AA' | 'AAA' | 'fail' = 'fail';
  let passes = false;
  
  if (ratio >= 7) {
    level = 'AAA';
    passes = true;
  } else if (ratio >= 4.5) {
    level = 'AA';
    passes = true;
  }
  
  return { ratio, passes, level };
};

/**
 * Simplified contrast ratio calculation
 */
const calculateContrastRatio = (foreground: string, background: string): number => {
  // This is a placeholder implementation
  // Real implementation would parse RGB values and calculate luminance
  // For testing purposes, return a mock value
  const fgLuminance = 0.5; // Mock value
  const bgLuminance = 0.1; // Mock value
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Test ARIA labels and descriptions
 */
export const testARIALabels = (container: HTMLElement): {
  elementsWithLabels: number;
  elementsWithoutLabels: number;
  invalidARIA: string[];
  issues: string[];
} => {
  const issues: string[] = [];
  const invalidARIA: string[] = [];
  let elementsWithLabels = 0;
  let elementsWithoutLabels = 0;
  
  // Elements that require labels
  const requiresLabels = container.querySelectorAll('input, button, select, textarea, [role="button"], [role="link"]');
  
  requiresLabels.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    const ariaLabel = htmlElement.getAttribute('aria-label');
    const ariaLabelledby = htmlElement.getAttribute('aria-labelledby');
    const label = container.querySelector(`label[for="${htmlElement.id}"]`);
    const hasText = htmlElement.textContent?.trim();
    
    if (ariaLabel || ariaLabelledby || label || hasText) {
      elementsWithLabels++;
    } else {
      elementsWithoutLabels++;
      issues.push(`Element at index ${index} lacks accessible label`);
    }
    
    // Check for invalid ARIA attributes
    const ariaAttributes = Array.from(htmlElement.attributes)
      .filter(attr => attr.name.startsWith('aria-'));
    
    ariaAttributes.forEach(attr => {
      // Simplified validation - in real implementation, use proper ARIA spec
      if (!isValidARIAAttribute(attr.name, attr.value)) {
        invalidARIA.push(`${attr.name}="${attr.value}" on element at index ${index}`);
      }
    });
  });
  
  return {
    elementsWithLabels,
    elementsWithoutLabels,
    invalidARIA,
    issues,
  };
};

/**
 * Simplified ARIA attribute validation
 */
const isValidARIAAttribute = (name: string, value: string): boolean => {
  // This is a simplified check - real implementation would be more comprehensive
  const booleanAttributes = ['aria-hidden', 'aria-expanded', 'aria-checked'];
  const stringAttributes = ['aria-label', 'aria-describedby', 'aria-labelledby'];
  
  if (booleanAttributes.includes(name)) {
    return value === 'true' || value === 'false';
  }
  
  if (stringAttributes.includes(name)) {
    return value.length > 0;
  }
  
  return true; // Assume valid for unknown attributes
};

/**
 * Test semantic HTML structure
 */
export const testSemanticStructure = (container: HTMLElement): {
  hasMainLandmark: boolean;
  headingStructure: { level: number; text: string }[];
  landmarks: string[];
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for main landmark
  const mainElement = container.querySelector('main, [role="main"]');
  const hasMainLandmark = !!mainElement;
  
  if (!hasMainLandmark) {
    issues.push('Missing main landmark');
  }
  
  // Check heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingStructure = Array.from(headings).map(heading => ({
    level: parseInt(heading.tagName.charAt(1)),
    text: heading.textContent?.trim() || '',
  }));
  
  // Validate heading hierarchy
  let lastLevel = 0;
  headingStructure.forEach((heading, index) => {
    if (index === 0 && heading.level !== 1) {
      issues.push('Page should start with h1');
    }
    if (heading.level > lastLevel + 1) {
      issues.push(`Heading level ${heading.level} skips levels (should be ${lastLevel + 1})`);
    }
    lastLevel = heading.level;
  });
  
  // Check for landmarks
  const landmarkSelectors = [
    'main, [role="main"]',
    'nav, [role="navigation"]',
    'aside, [role="complementary"]',
    'header, [role="banner"]',
    'footer, [role="contentinfo"]',
    '[role="region"]',
  ];
  
  const landmarks: string[] = [];
  landmarkSelectors.forEach(selector => {
    const elements = container.querySelectorAll(selector);
    if (elements.length > 0) {
      landmarks.push(selector.split(',')[0]); // Get the first part (HTML5 element)
    }
  });
  
  return {
    hasMainLandmark,
    headingStructure,
    landmarks,
    issues,
  };
};

/**
 * Test screen reader compatibility
 */
export const testScreenReaderCompatibility = (container: HTMLElement): {
  hiddenElements: number;
  ariaLiveRegions: number;
  skipLinks: number;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for screen reader only content
  const hiddenElements = container.querySelectorAll('[aria-hidden="true"]').length;
  
  // Check for ARIA live regions
  const ariaLiveRegions = container.querySelectorAll('[aria-live]').length;
  
  // Check for skip links
  const skipLinks = container.querySelectorAll('a[href^="#"]').length;
  
  // Check for images without alt text
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image at index ${index} missing alt attribute`);
    }
  });
  
  return {
    hiddenElements,
    ariaLiveRegions,
    skipLinks,
    issues,
  };
};

/**
 * Generate accessibility recommendations based on violations
 */
const generateAccessibilityRecommendations = (violations: AccessibilityViolation[]): string[] => {
  const recommendations: string[] = [];
  
  violations.forEach(violation => {
    switch (violation.id) {
      case 'color-contrast':
        recommendations.push('Increase color contrast to meet WCAG AA standards (4.5:1 ratio)');
        break;
      case 'label':
        recommendations.push('Add proper labels to form elements using aria-label or associated label elements');
        break;
      case 'keyboard':
        recommendations.push('Ensure all interactive elements are keyboard accessible');
        break;
      case 'focus-order-semantics':
        recommendations.push('Fix focus order and ensure logical tab sequence');
        break;
      case 'link-name':
        recommendations.push('Provide descriptive text for links');
        break;
      case 'bypass':
        recommendations.push('Add skip navigation links for keyboard users');
        break;
      case 'page-has-heading-one':
        recommendations.push('Ensure page has a main heading (h1)');
        break;
      case 'landmark-one-main':
        recommendations.push('Add a main landmark to the page');
        break;
      case 'region':
        recommendations.push('Use semantic HTML5 elements or ARIA landmarks');
        break;
      default:
        recommendations.push(`Address ${violation.id}: ${violation.help}`);
    }
  });
  
  return [...new Set(recommendations)]; // Remove duplicates
};

/**
 * Test mobile accessibility
 */
export const testMobileAccessibility = (container: HTMLElement): {
  touchTargetSize: { adequate: number; inadequate: number };
  orientationSupport: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  let adequateTouchTargets = 0;
  let inadequateTouchTargets = 0;
  
  // Test touch target sizes (minimum 44x44px)
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
  
  interactiveElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // 44px minimum for WCAG AA
    
    if (rect.width >= minSize && rect.height >= minSize) {
      adequateTouchTargets++;
    } else {
      inadequateTouchTargets++;
      issues.push(`Interactive element at index ${index} has inadequate touch target size (${rect.width}x${rect.height}px)`);
    }
  });
  
  // Test orientation support (simplified)
  const supportsOrientation = window.screen && 'orientation' in window.screen;
  
  return {
    touchTargetSize: {
      adequate: adequateTouchTargets,
      inadequate: inadequateTouchTargets,
    },
    orientationSupport: supportsOrientation,
    issues,
  };
};

/**
 * Generate comprehensive accessibility report
 */
export const generateAccessibilityReport = async (
  container: HTMLElement = document.body
): Promise<AccessibilityReport> => {
  // Run axe audit
  const axeResults = await runAccessibilityAudit(container);
  
  // Additional manual tests
  const keyboardTest = testKeyboardNavigation(container);
  const ariaTest = testARIALabels(container);
  const structureTest = testSemanticStructure(container);
  const screenReaderTest = testScreenReaderCompatibility(container);
  const mobileTest = testMobileAccessibility(container);
  
  // Combine all issues and recommendations
  const allIssues = [
    ...keyboardTest.issues,
    ...ariaTest.issues,
    ...structureTest.issues,
    ...screenReaderTest.issues,
    ...mobileTest.issues,
  ];
  
  const additionalRecommendations = [
    ...keyboardTest.missingFocusIndicators > 0 ? ['Add visible focus indicators to all interactive elements'] : [],
    ...keyboardTest.focusTraps > 0 ? ['Remove positive tabindex values to avoid focus traps'] : [],
    ...ariaTest.elementsWithoutLabels > 0 ? ['Add accessible labels to unlabeled elements'] : [],
    ...!structureTest.hasMainLandmark ? ['Add a main landmark to the page'] : [],
    ...mobileTest.touchTargetSize.inadequate > 0 ? ['Increase touch target sizes to at least 44x44px'] : [],
  ];
  
  return {
    ...axeResults,
    violations: [
      ...axeResults.violations,
      ...allIssues.map(issue => ({
        id: 'manual-test',
        impact: 'moderate' as const,
        description: issue,
        help: issue,
        helpUrl: '',
        nodes: [],
      })),
    ],
    recommendations: [
      ...axeResults.recommendations,
      ...additionalRecommendations,
    ],
  };
};