# 🚨 Security Vulnerabilities Documentation

This document catalogs all intentionally introduced security vulnerabilities for CodeQL testing purposes. **DO NOT USE THIS CODE IN PRODUCTION!**

## Overview

This codebase contains **15+ different types of security vulnerabilities** that CodeQL should detect. Each vulnerability is marked with `🚨 CODEQL ISSUE:` comments for easy identification.

---

## 1. Command Injection Vulnerabilities

### Location: `src/index.js:252`
**Severity: Critical**

```javascript
// 🚨 CODEQL ISSUE: Command injection - user input directly in exec
exec(`cat /var/log/${logFile}`, (error, stdout, stderr) => {
```

**Attack Vector:** 
- `GET /admin/logs?file=../../../etc/passwd`
- `GET /admin/logs?file=app.log; rm -rf /`

**CodeQL Rule:** `js/command-line-injection`

---

## 2. Path Traversal Vulnerabilities

### Location: `src/index.js:271`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: Path traversal - no validation of user input
const filePath = path.join('/app/public/', filename);
```

**Attack Vector:**
- `GET /files?name=../../../etc/passwd`
- `GET /files?name=../../../../root/.ssh/id_rsa`

**CodeQL Rule:** `js/path-injection`

---

## 3. Cross-Site Scripting (XSS)

### Location: `src/index.js:287`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: XSS - user input directly in HTML response
res.send(`<p>You searched for: ${query}</p>`);
```

**Attack Vector:**
- `GET /search?q=<script>alert('XSS')</script>`
- `GET /search?q=<img src=x onerror=alert(document.cookie)>`

**CodeQL Rule:** `js/xss`

### Location: `src/channels/emailChannel.js:107`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Unescaped user input in HTML
<p style="font-size: 14px; color: #333;">Note: ${userInput}</p>
```

**CodeQL Rule:** `js/xss-through-dom`

---

## 4. SQL Injection (Simulated)

### Location: `src/index.js:308`
**Severity: Critical**

```javascript
// 🚨 CODEQL ISSUE: SQL injection - user input directly in query
const query = `SELECT * FROM users WHERE id = '${userId}'`;
```

**Attack Vector:**
- `GET /users?id=1' OR '1'='1`
- `GET /users?id=1'; DROP TABLE users; --`

**CodeQL Rule:** `js/sql-injection`

---

## 5. Hardcoded Secrets

### Location: `src/index.js:15-17`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';
const JWT_SECRET = 'my-super-secret-key';
```

**CodeQL Rule:** `js/hardcoded-credentials`

---

## 6. Insecure Randomness

### Location: `src/utils/otpGenerator.js:12-15`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Using Math.random() for security-sensitive operations
return Math.floor(Math.random() * (max - min + 1) + min).toString();
```

**Attack Vector:** Predictable OTP generation allowing brute force attacks.

**CodeQL Rule:** `js/insecure-randomness`

---

## 7. Prototype Pollution

### Location: `src/vulnerableUtils.js:8-16`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: Unsafe recursive merge that allows prototype pollution
for (const key in source) {
  if (typeof source[key] === 'object' && source[key] !== null) {
    if (!target[key]) target[key] = {};
    mergeConfig(target[key], source[key]);
  } else {
    target[key] = source[key];
  }
}
```

**Attack Vector:**
```json
{
  "__proto__": {
    "isAdmin": true
  }
}
```

**CodeQL Rule:** `js/prototype-pollution`

---

## 8. Regular Expression Denial of Service (ReDoS)

### Location: `src/vulnerableUtils.js:22`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Catastrophic backtracking regex
const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
```

**Attack Vector:** 
- Input: `a@a.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!`

**CodeQL Rule:** `js/redos`

### Location: `src/vulnerableUtils.js:29`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Exponential time complexity regex
const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})([\s]?(ext|x|extension)[\s]?(\d+))?$/;
```

**CodeQL Rule:** `js/redos`

---

## 9. Information Disclosure

### Location: `src/vulnerableUtils.js:35-45`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Logging sensitive information
console.log('Error occurred:', {
  body: request?.body, // Could contain passwords
  headers: request?.headers, // Could contain auth tokens
});
```

**CodeQL Rule:** `js/clear-text-logging`

---

## 10. Unsafe Deserialization

### Location: `src/vulnerableUtils.js:51-62`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: Unsafe JSON.parse without validation
const data = JSON.parse(jsonString);
if (data.__proto__) {
  console.log('Proto found:', data.__proto__);
}
```

**CodeQL Rule:** `js/unsafe-deserialization`

---

## 11. Timing Attack Vulnerability

### Location: `src/vulnerableUtils.js:67-77`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Non-constant time comparison
for (let i = 0; i < input.length; i++) {
  if (input[i] !== stored[i]) {
    return false; // Early return allows timing attacks
  }
}
```

**CodeQL Rule:** `js/timing-attack`

---

## 12. Insecure Cookie Settings

### Location: `src/vulnerableUtils.js:82-89`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: Cookie without secure flags
res.cookie(name, value, {
  httpOnly: false,  // Should be true
  secure: false,    // Should be true in production
  sameSite: 'none', // Should be 'strict' or 'lax'
});
```

**CodeQL Rule:** `js/insecure-cookie`

---

## 13. Weak Cryptographic Algorithm

### Location: `src/vulnerableUtils.js:95-98`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: Using MD5 for password hashing
return crypto.createHash('md5').update(password).digest('hex');
```

**CodeQL Rule:** `js/weak-cryptographic-algorithm`

---

## 14. Server-Side Request Forgery (SSRF)

### Location: `src/vulnerableUtils.js:104-107`
**Severity: High**

```javascript
// 🚨 CODEQL ISSUE: No URL validation - allows SSRF attacks
const response = await fetch(url);
```

**Attack Vector:**
- `GET /proxy?url=http://localhost:22`
- `GET /proxy?url=http://169.254.169.254/latest/meta-data/`

**CodeQL Rule:** `js/request-forgery`

---

## 15. Race Condition Vulnerability

### Location: `src/vulnerableUtils.js:129-138`
**Severity: Low**

```javascript
// 🚨 CODEQL ISSUE: Race condition in concurrent access
const current = globalCounter;
setTimeout(() => {
  globalCounter = current + 1;
}, 1);
```

**CodeQL Rule:** `js/race-condition`

---

## 16. Insecure Direct Object Reference

### Location: `src/vulnerableUtils.js:118-123`
**Severity: Medium**

```javascript
// 🚨 CODEQL ISSUE: No access control validation
const filePath = `/users/${userId}/files/${fileId}`;
```

**CodeQL Rule:** `js/insecure-direct-object-reference`

---

## Testing the Vulnerabilities

### Command Injection Test:
```bash
curl "http://localhost:3000/admin/logs?file=../../../etc/passwd"
curl "http://localhost:3000/admin/logs?file=app.log;whoami"
```

### Path Traversal Test:
```bash
curl "http://localhost:3000/files?name=../package.json"
curl "http://localhost:3000/files?name=../../../../etc/hosts"
```

### XSS Test:
```bash
curl "http://localhost:3000/search?q=<script>alert('XSS')</script>"
```

### SQL Injection Test:
```bash
curl "http://localhost:3000/users?id=1' OR '1'='1"
```

### ReDoS Test:
```bash
curl -X POST "http://localhost:3000/validate" \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"}'
```

### Prototype Pollution Test:
```bash
curl -X POST "http://localhost:3000/config" \
  -H "Content-Type: application/json" \
  -d '{"config":"{\"__proto__\":{\"isAdmin\":true}}"}'
```

### SSRF Test:
```bash
curl "http://localhost:3000/proxy?url=http://localhost:22"
curl "http://localhost:3000/proxy?url=http://169.254.169.254/"
```

---

## Expected CodeQL Findings

When running CodeQL analysis, you should see alerts for:

1. **CWE-78**: Command Injection
2. **CWE-22**: Path Traversal 
3. **CWE-79**: Cross-site Scripting
4. **CWE-89**: SQL Injection
5. **CWE-798**: Hardcoded Credentials
6. **CWE-338**: Weak Random Number Generator
7. **CWE-1321**: Prototype Pollution
8. **CWE-1333**: Regular Expression DoS
9. **CWE-209**: Information Exposure
10. **CWE-502**: Unsafe Deserialization
11. **CWE-208**: Timing Attack
12. **CWE-614**: Insecure Cookie
13. **CWE-327**: Weak Cryptography
14. **CWE-918**: Server-Side Request Forgery
15. **CWE-362**: Race Condition

---

## Remediation Notes

⚠️ **This code is intentionally vulnerable for testing purposes only!**

For each vulnerability type, proper remediation would involve:
- Input validation and sanitization
- Parameterized queries
- Secure cryptographic functions
- Proper error handling
- Access controls
- Rate limiting
- Security headers

---

## File Structure

```
src/
├── index.js                 # Main server with multiple vulnerabilities
├── utils/
│   └── otpGenerator.js      # Insecure randomness
├── channels/
│   └── emailChannel.js      # XSS and prototype pollution
└── vulnerableUtils.js       # Collection of various vulnerabilities
```

Each file contains detailed comments marking every vulnerability for easy identification during CodeQL analysis.
