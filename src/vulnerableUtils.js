/**
 * 🚨 CODEQL ISSUES: Multiple security vulnerabilities in utility functions
 */

/**
 * 🚨 CODEQL ISSUE: Prototype pollution vulnerability
 */
export function mergeConfig(target, source) {
  // 🚨 CODEQL ISSUE: Unsafe recursive merge that allows prototype pollution
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      mergeConfig(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * 🚨 CODEQL ISSUE: ReDoS (Regular Expression Denial of Service)
 */
export function validateEmail(email) {
  // 🚨 CODEQL ISSUE: Catastrophic backtracking regex
  const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return emailRegex.test(email);
}

/**
 * 🚨 CODEQL ISSUE: Another ReDoS vulnerability
 */
export function validatePhoneNumber(phone) {
  // 🚨 CODEQL ISSUE: Exponential time complexity regex
  const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})([\s]?(ext|x|extension)[\s]?(\d+))?$/;
  return phoneRegex.test(phone);
}

/**
 * 🚨 CODEQL ISSUE: Information disclosure
 */
export function logError(error, request) {
  // 🚨 CODEQL ISSUE: Logging sensitive information
  console.log('Error occurred:', {
    message: error.message,
    stack: error.stack,
    userAgent: request?.headers['user-agent'],
    ip: request?.ip,
    body: request?.body, // Could contain passwords or sensitive data
    headers: request?.headers, // Could contain auth tokens
    timestamp: new Date().toISOString()
  });
}

/**
 * 🚨 CODEQL ISSUE: Unsafe deserialization
 */
export function parseUserData(jsonString) {
  try {
    // 🚨 CODEQL ISSUE: Unsafe JSON.parse without validation
    const data = JSON.parse(jsonString);
    
    // 🚨 CODEQL ISSUE: Direct property access that could be exploited
    if (data.__proto__) {
      console.log('Proto found:', data.__proto__);
    }
    
    return data;
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
}

/**
 * 🚨 CODEQL ISSUE: Timing attack vulnerability
 */
export function comparePasswords(input, stored) {
  // 🚨 CODEQL ISSUE: Non-constant time comparison
  if (input.length !== stored.length) {
    return false;
  }
  
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== stored[i]) {
      return false; // Early return allows timing attacks
    }
  }
  return true;
}

/**
 * 🚨 CODEQL ISSUE: Insecure cookie settings
 */
export function setCookie(res, name, value) {
  // 🚨 CODEQL ISSUE: Cookie without secure flags
  res.cookie(name, value, {
    httpOnly: false,  // Should be true for security
    secure: false,    // Should be true in production
    sameSite: 'none', // Should be 'strict' or 'lax'
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year - too long for sensitive data
  });
}

/**
 * 🚨 CODEQL ISSUE: Weak cryptographic algorithm
 */
export function hashPassword(password) {
  const crypto = require('crypto');
  // 🚨 CODEQL ISSUE: Using MD5 for password hashing
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * 🚨 CODEQL ISSUE: Server-Side Request Forgery (SSRF)
 */
export async function fetchExternalData(url) {
  // 🚨 CODEQL ISSUE: No URL validation - allows SSRF attacks
  const response = await fetch(url);
  return response.json();
}

/**
 * 🚨 CODEQL ISSUE: XML External Entity (XXE) simulation
 */
export function parseXMLConfig(xmlString) {
  // 🚨 CODEQL ISSUE: This would be vulnerable to XXE if using real XML parser
  console.log('Parsing XML (vulnerable to XXE):', xmlString);
  // In real implementation, this would use unsafe XML parsing
  return { warning: 'This would be vulnerable to XXE attacks' };
}

/**
 * 🚨 CODEQL ISSUE: Insecure direct object reference
 */
export function getUserFile(userId, fileId) {
  // 🚨 CODEQL ISSUE: No access control validation
  const filePath = `/users/${userId}/files/${fileId}`;
  console.log('Accessing file without authorization check:', filePath);
  return { path: filePath, warning: 'No access control validation' };
}

/**
 * 🚨 CODEQL ISSUE: Race condition vulnerability
 */
let globalCounter = 0;
export function incrementCounter() {
  // 🚨 CODEQL ISSUE: Race condition in concurrent access
  const current = globalCounter;
  // Simulate some processing time
  setTimeout(() => {
    globalCounter = current + 1;
  }, 1);
  return globalCounter;
}

/**
 * 🚨 CODEQL ISSUE: Additional XSS vulnerability for testing
 */
export function renderUserContent(userInput) {
  // 🚨 CODEQL ISSUE: Direct HTML injection without sanitization
  return `<div class="user-content">${userInput}</div>`;
}
