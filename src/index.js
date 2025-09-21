import express from 'express';
import { OTPService } from './otpService.js';
import { exec } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize OTP Service with configuration
const otpService = new OTPService({
  otpLength: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  sms: {
    provider: 'Demo SMS Gateway',
    fromNumber: '+1-555-OTP-DEMO'
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
 * Test endpoint for command execution (VULNERABLE - for testing)
 */
app.get('/test/logs', (req, res) => {
  const logFile = req.query.file || 'app.log';
  // This is intentionally vulnerable for testing CodeQL detection
  exec(`cat /var/log/${logFile}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ logs: stdout });
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
      'GET /test/logs': '⚠️  TEST: Command injection (for CodeQL testing)'
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
