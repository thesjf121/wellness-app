/**
 * Security Testing Utilities
 * Provides helper functions for testing security vulnerabilities and compliance
 */

// Mock data for security testing
export const SECURITY_TEST_DATA = {
  // XSS attack vectors
  XSS_PAYLOADS: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')" />',
    '<svg onload="alert(\'XSS\')" />',
    '"><script>alert("XSS")</script>',
    "';alert('XSS');//",
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  ],

  // SQL injection patterns (for API testing)
  SQL_INJECTION_PAYLOADS: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "1'; UNION SELECT NULL, NULL, NULL--",
    "admin'--",
    "' OR 1=1#",
    "1' AND (SELECT COUNT(*) FROM users) > 0--",
  ],

  // Malicious file uploads
  MALICIOUS_FILES: [
    { name: 'test.php', content: '<?php system($_GET["cmd"]); ?>' },
    { name: 'test.jsp', content: '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>' },
    { name: 'test.asp', content: '<% eval request("cmd") %>' },
    { name: 'test.exe', content: 'MZ\x90\x00' }, // PE header
  ],

  // Authentication bypass attempts
  AUTH_BYPASS_ATTEMPTS: [
    { email: 'admin', password: 'admin' },
    { email: 'test@test.com', password: '' },
    { email: '', password: 'password' },
    { email: 'admin@localhost', password: 'password123' },
  ],

  // Sensitive data patterns
  SENSITIVE_DATA_PATTERNS: [
    /\b4[0-9]{12}(?:[0-9]{3})?\b/, // Credit card numbers
    /\b5[1-5][0-9]{14}\b/, // MasterCard
    /\b3[47][0-9]{13}\b/, // American Express
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN format
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/, // IP addresses
    /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/, // JWT tokens
  ],
};

/**
 * Test for XSS vulnerabilities in text inputs
 */
export const testXSSVulnerability = (inputElement: HTMLElement, payload: string): boolean => {
  try {
    // Simulate user input
    if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
      inputElement.value = payload;
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    // Check if the payload was properly escaped/sanitized
    const parentElement = inputElement.parentElement || document.body;
    const innerHTML = parentElement.innerHTML;
    
    // If the raw script tags are present, it's vulnerable
    if (innerHTML.includes('<script>') || innerHTML.includes('javascript:')) {
      console.warn(`XSS vulnerability detected with payload: ${payload}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error testing XSS vulnerability:', error);
    return false;
  }
};

/**
 * Test for CSRF protection
 */
export const testCSRFProtection = async (endpoint: string, data: any): Promise<boolean> => {
  try {
    // Attempt request without CSRF token
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // If request succeeds without CSRF token, it's vulnerable
    if (response.ok) {
      console.warn(`CSRF vulnerability detected at endpoint: ${endpoint}`);
      return false;
    }

    return true;
  } catch (error) {
    // Network errors are expected if CSRF protection is working
    return true;
  }
};

/**
 * Test for insecure data storage in localStorage/sessionStorage
 */
export const testInsecureDataStorage = (): string[] => {
  const vulnerabilities: string[] = [];
  
  // Check localStorage for sensitive data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        SECURITY_TEST_DATA.SENSITIVE_DATA_PATTERNS.forEach((pattern, index) => {
          if (pattern.test(value)) {
            vulnerabilities.push(`Sensitive data found in localStorage[${key}] - Pattern ${index}`);
          }
        });
      }
    }
  }

  // Check sessionStorage for sensitive data
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      if (value) {
        SECURITY_TEST_DATA.SENSITIVE_DATA_PATTERNS.forEach((pattern, index) => {
          if (pattern.test(value)) {
            vulnerabilities.push(`Sensitive data found in sessionStorage[${key}] - Pattern ${index}`);
          }
        });
      }
    }
  }

  return vulnerabilities;
};

/**
 * Test for weak password validation
 */
export const testPasswordStrength = (password: string): {
  score: number;
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    issues.push('Password should be at least 8 characters long');
  }

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else issues.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else issues.push('Password should contain uppercase letters');

  if (/\d/.test(password)) score += 1;
  else issues.push('Password should contain numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else issues.push('Password should contain special characters');

  // Common password check
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    issues.push('Password is too common');
  }

  return { score, issues };
};

/**
 * Test for secure HTTP headers
 */
export const testSecurityHeaders = async (url: string): Promise<{
  missing: string[];
  present: string[];
}> => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  try {
    const response = await fetch(url);
    
    requiredHeaders.forEach(header => {
      if (response.headers.get(header)) {
        present.push(header);
      } else {
        missing.push(header);
      }
    });
  } catch (error) {
    console.error('Error testing security headers:', error);
  }

  return { missing, present };
};

/**
 * Test for information disclosure
 */
export const testInformationDisclosure = (htmlContent: string): string[] => {
  const disclosures: string[] = [];
  
  // Check for stack traces
  if (htmlContent.includes('at ') && htmlContent.includes('.js:')) {
    disclosures.push('JavaScript stack trace detected');
  }

  // Check for server information
  if (htmlContent.includes('Server: ') || htmlContent.includes('X-Powered-By: ')) {
    disclosures.push('Server information exposed');
  }

  // Check for database errors
  const dbErrorPatterns = [
    /SQL syntax.*near/i,
    /ORA-\d+/i,
    /MySQL Error/i,
    /PostgreSQL.*ERROR/i
  ];

  dbErrorPatterns.forEach((pattern, index) => {
    if (pattern.test(htmlContent)) {
      disclosures.push(`Database error pattern ${index} detected`);
    }
  });

  // Check for debug information
  if (htmlContent.includes('DEBUG') || htmlContent.includes('console.log')) {
    disclosures.push('Debug information exposed');
  }

  return disclosures;
};

/**
 * Test rate limiting
 */
export const testRateLimiting = async (
  endpoint: string, 
  requests: number = 100,
  timeWindow: number = 1000
): Promise<boolean> => {
  const startTime = Date.now();
  let successfulRequests = 0;
  let blockedRequests = 0;

  const promises = Array.from({ length: requests }, async () => {
    try {
      const response = await fetch(endpoint);
      if (response.status === 429) {
        blockedRequests++;
      } else if (response.ok) {
        successfulRequests++;
      }
    } catch (error) {
      // Network errors could indicate rate limiting
      blockedRequests++;
    }
  });

  await Promise.all(promises);
  
  const endTime = Date.now();
  const actualTimeWindow = endTime - startTime;

  // If all requests succeeded and completed quickly, rate limiting might be missing
  if (successfulRequests === requests && actualTimeWindow < timeWindow) {
    console.warn(`Potential rate limiting issue: ${successfulRequests}/${requests} requests succeeded in ${actualTimeWindow}ms`);
    return false;
  }

  return blockedRequests > 0;
};

/**
 * Test for session fixation vulnerabilities
 */
export const testSessionFixation = (): boolean => {
  const beforeLogin = document.cookie;
  
  // Simulate login (this would need to be adapted to actual login flow)
  // For now, just check if session ID changes
  const sessionIdBefore = extractSessionId(beforeLogin);
  
  // After login check would need to be implemented based on actual auth flow
  // This is a placeholder for the concept
  
  return sessionIdBefore !== null;
};

/**
 * Extract session ID from cookie string
 */
const extractSessionId = (cookieString: string): string | null => {
  const sessionMatch = cookieString.match(/JSESSIONID=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
};

/**
 * Test for clickjacking vulnerabilities
 */
export const testClickjacking = (): boolean => {
  try {
    // Check if the page can be embedded in an iframe
    if (window.top !== window.self) {
      console.warn('Page is running inside an iframe - potential clickjacking risk');
      return false;
    }
    
    // Check for X-Frame-Options header via CSP
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    let hasFrameAncestors = false;
    
    metaTags.forEach(meta => {
      const content = meta.getAttribute('content');
      if (content && content.includes('frame-ancestors')) {
        hasFrameAncestors = true;
      }
    });
    
    return hasFrameAncestors;
  } catch (error) {
    console.error('Error testing clickjacking protection:', error);
    return false;
  }
};

/**
 * Generate security test report
 */
export const generateSecurityReport = async (baseUrl: string): Promise<{
  score: number;
  vulnerabilities: string[];
  recommendations: string[];
}> => {
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  // Test XSS protection
  const xssTestElement = document.createElement('input');
  SECURITY_TEST_DATA.XSS_PAYLOADS.forEach(payload => {
    if (testXSSVulnerability(xssTestElement, payload)) {
      vulnerabilities.push(`XSS vulnerability with payload: ${payload}`);
    }
  });

  // Test data storage security
  const storageVulns = testInsecureDataStorage();
  vulnerabilities.push(...storageVulns);

  // Test security headers
  const headerTest = await testSecurityHeaders(baseUrl);
  headerTest.missing.forEach(header => {
    vulnerabilities.push(`Missing security header: ${header}`);
    recommendations.push(`Implement ${header} header`);
  });

  // Test clickjacking protection
  if (!testClickjacking()) {
    vulnerabilities.push('Clickjacking protection not detected');
    recommendations.push('Implement X-Frame-Options or CSP frame-ancestors');
  }

  // Calculate security score (0-100)
  const maxScore = 100;
  const penaltyPerVuln = 10;
  const score = Math.max(0, maxScore - (vulnerabilities.length * penaltyPerVuln));

  return {
    score,
    vulnerabilities,
    recommendations
  };
};