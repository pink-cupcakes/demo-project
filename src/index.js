import express from 'express';
import { OTPService } from './otpService.js';
import { exec } from 'child_process'; // 🚨 CODEQL ISSUE: Command injection potential
import fs from 'fs';
import path from 'path';
import { 
  parseUserData, 
  validateEmail, 
  validatePhoneNumber, 
  setCookie,
  hashPassword,
  fetchExternalData,
  comparePasswords
} from './vulnerableUtils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚨 CODEQL ISSUE: Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef'; // Should be in environment variables
const DB_PASSWORD = 'admin123'; // Should be in environment variables
const JWT_SECRET = 'my-super-secret-key'; // Should be in environment variables

// 🚨 CODEQL ISSUE: Additional hardcoded secret for testing
const TEST_SECRET = 'test-secret-12345'; // New vulnerability for testing macro

// Initialize OTP Service with configuration
const otpService = new OTPService({
  otpLength: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  sms: {
    provider: 'Demo SMS Gateway',
    fromNumber: '+1-555-OTP-DEMO',
    apiKey: API_KEY // 🚨 CODEQL ISSUE: Using hardcoded secret
  },
  email: {
    provider: 'Demo Email Service',
    fromEmail: 'otp@demo-service.com',
    fromName: 'OTP Demo Service'
  },
  push: {
    provider: 'Demo Push Service',
    appName: 'OTP Demo App'
  }
});

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'OTP Demo Service',
    version: '1.0.0'
  });
});

/**
 * Get service statistics
 */
app.get('/stats', (req, res) => {
  const stats = otpService.getStats();
  res.json(stats);
});

/**
 * 🚨 CODEQL ISSUE: Unsafe deserialization endpoint
 */
app.post('/config', (req, res) => {
  try {
    const configData = req.body.config;
    // 🚨 CODEQL ISSUE: Unsafe JSON parsing of user input
    const parsedConfig = parseUserData(configData);
    res.json({ success: true, config: parsedConfig });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 🚨 CODEQL ISSUE: Weak authentication endpoint
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const storedPassword = 'admin123'; // 🚨 CODEQL ISSUE: Hardcoded password
  
  // 🚨 CODEQL ISSUE: Weak password hashing
  const hashedInput = hashPassword(password);
  const hashedStored = hashPassword(storedPassword);
  
  // 🚨 CODEQL ISSUE: Timing attack vulnerability
  if (comparePasswords(hashedInput, hashedStored)) {
    // 🚨 CODEQL ISSUE: Insecure cookie settings
    setCookie(res, 'session', 'admin-session-123');
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

/**
 * 🚨 CODEQL ISSUE: SSRF vulnerability
 */
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL required' });
    }
    
    // 🚨 CODEQL ISSUE: No URL validation - allows SSRF
    const data = await fetchExternalData(targetUrl);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🚨 CODEQL ISSUE: Email validation with ReDoS
 */
app.post('/validate', (req, res) => {
  const { email, phone } = req.body;
  
  // 🚨 CODEQL ISSUE: ReDoS vulnerability in validation
  const emailValid = validateEmail(email);
  const phoneValid = validatePhoneNumber(phone);
  
  res.json({
    email: { value: email, valid: emailValid },
    phone: { value: phone, valid: phoneValid }
  });
});

/**
 * Generate and send OTP
 * POST /otp/generate
 * Body: {
 *   identifier: "user@example.com" | "+1234567890" | "device_token_123",
 *   channels: ["sms", "email"] | "push",
 *   options: { ... }
 * }
 */
app.post('/otp/generate', async (req, res) => {
  try {
    const { identifier, channels = 'sms', options = {} } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'identifier is required'
      });
    }

    const result = await otpService.generateAndSend(identifier, channels, options);
    
    // Remove OTP from response in production
    const response = { ...result };
    if (process.env.NODE_ENV === 'production') {
      delete response.otp;
    }

    res.json(response);
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify OTP
 * POST /otp/verify
 * Body: {
 *   sessionId: "otp_123...",
 *   otp: "123456"
 * }
 */
app.post('/otp/verify', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and otp are required'
      });
    }

    const result = await otpService.verify(sessionId, otp);
    res.json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Resend OTP
 * POST /otp/resend
 * Body: {
 *   sessionId: "otp_123...",
 *   channels: ["email"] (optional)
 * }
 */
app.post('/otp/resend', async (req, res) => {
  try {
    const { sessionId, channels } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    const result = await otpService.resend(sessionId, channels);
    res.json(result);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get session status
 * GET /otp/session/:sessionId
 */
app.get('/otp/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = otpService.getSessionStatus(sessionId);
    res.json(status);
  } catch (error) {
    console.error('Get session status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Clean up expired sessions
 * POST /otp/cleanup
 */
app.post('/otp/cleanup', (req, res) => {
  try {
    const cleaned = otpService.cleanupExpiredSessions();
    res.json({
      success: true,
      cleanedSessions: cleaned,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Demo endpoint - Multiple channels showcase
 * POST /demo/multi-channel
 * Body: {
 *   phone: "+1234567890",
 *   email: "user@example.com",
 *   deviceToken: "device_token_123"
 * }
 */
app.post('/demo/multi-channel', async (req, res) => {
  try {
    const { phone, email, deviceToken } = req.body;
    const results = [];

    // Generate OTP for each channel
    if (phone) {
      const smsResult = await otpService.generateAndSend(phone, 'sms');
      results.push({ channel: 'SMS', identifier: phone, ...smsResult });
    }

    if (email) {
      const emailResult = await otpService.generateAndSend(email, 'email');
      results.push({ channel: 'Email', identifier: email, ...emailResult });
    }

    if (deviceToken) {
      const pushResult = await otpService.generateAndSend(deviceToken, 'push');
      results.push({ channel: 'Push', identifier: deviceToken, ...pushResult });
    }

    res.json({
      success: true,
      message: 'Multi-channel OTP demo completed',
      results,
      totalChannels: results.length,
      totalCost: results.reduce((sum, r) => sum + (r.totalCost || 0), 0)
    });
  } catch (error) {
    console.error('Multi-channel demo error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🚨 CODEQL ISSUE: Command injection vulnerability
 * Dangerous endpoint that executes system commands
 */
app.get('/admin/logs', (req, res) => {
  const logFile = req.query.file || 'app.log';
  // 🚨 CODEQL ISSUE: Command injection - user input directly in exec
  exec(`cat /var/log/${logFile}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ logs: stdout });
  });
});

/**
 * 🚨 CODEQL ISSUE: Path traversal vulnerability
 */
app.get('/files', (req, res) => {
  const filename = req.query.name;
  if (!filename) {
    return res.status(400).json({ error: 'filename required' });
  }
  
  // 🚨 CODEQL ISSUE: Path traversal - no validation of user input
  const filePath = path.join('/app/public/', filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json({ content: data });
  });
});

/**
 * 🚨 CODEQL ISSUE: XSS vulnerability
 */
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  // 🚨 CODEQL ISSUE: XSS - user input directly in HTML response
  res.send(`
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${query}</p>
        <p>No results found for "${query}"</p>
      </body>
    </html>
  `);
});

/**
 * 🚨 CODEQL ISSUE: SQL injection simulation
 */
app.get('/users', (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    return res.status(400).json({ error: 'id required' });
  }
  
  // 🚨 CODEQL ISSUE: SQL injection - user input directly in query
  const query = `SELECT * FROM users WHERE id = '${userId}'`;
  console.log('Executing query:', query); // This would be dangerous in real DB
  
  // Simulated response
  res.json({ 
    query: query,
    warning: 'This would be vulnerable to SQL injection in real implementation',
    user: { id: userId, name: 'Demo User' }
  });
});

/**
 * API Documentation endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'OTP Demo Service',
    version: '1.0.0',
    description: 'A demo OTP service supporting multiple communication channels',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /stats': 'Service statistics',
      'POST /otp/generate': 'Generate and send OTP',
      'POST /otp/verify': 'Verify OTP code',
      'POST /otp/resend': 'Resend OTP',
      'GET /otp/session/:sessionId': 'Get session status',
      'POST /otp/cleanup': 'Clean expired sessions',
      'POST /demo/multi-channel': 'Multi-channel demo',
      'GET /admin/logs': '⚠️  VULNERABLE: Command injection',
      'GET /files': '⚠️  VULNERABLE: Path traversal',
      'GET /search': '⚠️  VULNERABLE: XSS',
      'GET /users': '⚠️  VULNERABLE: SQL injection',
      'POST /config': '⚠️  VULNERABLE: Unsafe deserialization',
      'POST /login': '⚠️  VULNERABLE: Weak authentication',
      'GET /proxy': '⚠️  VULNERABLE: SSRF',
      'POST /validate': '⚠️  VULNERABLE: ReDoS'
    },
    supportedChannels: ['sms', 'email', 'push'],
    documentation: 'See README.md for detailed usage examples'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 OTP Demo Service started`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Documentation: http://localhost:${PORT}/`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);
  console.log(`   Statistics: http://localhost:${PORT}/stats`);
  console.log(`\n📱 Supported Channels: SMS, Email, Push Notifications`);
  console.log(`\n💡 Try the multi-channel demo at: POST /demo/multi-channel`);
  
  // Clean up expired sessions every 5 minutes
  setInterval(() => {
    otpService.cleanupExpiredSessions();
  }, 5 * 60 * 1000);
});

export default app;
