# 🔐 OTP Service Demo

A simple, demo OTP (One-Time Password) service that supports multiple communication channels including SMS, Email, and Push Notifications.

## 🌟 Features

- **Multi-Channel Support**: SMS, Email, and Push Notifications
- **Secure OTP Generation**: Cryptographically secure random OTP codes
- **Configurable Settings**: OTP length, expiry time, max attempts
- **Session Management**: Track OTP sessions with unique identifiers
- **Resend Functionality**: Resend OTP via same or different channels
- **Rate Limiting**: Maximum attempts protection
- **Auto Cleanup**: Automatic cleanup of expired sessions
- **RESTful API**: Complete REST API for integration
- **Rich Notifications**: HTML email templates and rich push notifications

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run the demo script
npm run demo

# Start the API server
npm start

# Start in development mode (with auto-reload)
npm run dev
```

### Basic Usage

```javascript
import { OTPService } from './src/otpService.js';

const otpService = new OTPService();

// Generate and send OTP via SMS
const result = await otpService.generateAndSend('+1234567890', 'sms');
console.log('OTP:', result.otp);
console.log('Session ID:', result.sessionId);

// Verify OTP
const verification = await otpService.verify(result.sessionId, '123456');
console.log('Verified:', verification.success);
```

## 📱 Supported Channels

### SMS Channel
- Simulates SMS delivery via telecom providers
- Supports international phone numbers
- Delivery status tracking
- Cost calculation

```javascript
// SMS with custom template
await otpService.generateAndSend('+1234567890', 'sms', {
  sms: { template: 'Your code: {otp}. Expires in 5 min.' }
});
```

### Email Channel
- Rich HTML email templates
- Plain text fallback
- Delivery and open tracking
- Custom subject lines

```javascript
// Email with custom options
await otpService.generateAndSend('user@example.com', 'email', {
  email: { 
    subject: 'Your Verification Code',
    htmlTemplate: '<h1>Code: {otp}</h1>'
  }
});
```

### Push Notification Channel
- Rich push notifications
- Cross-platform support (iOS, Android, Web)
- Interactive actions
- Custom data payload

```javascript
// Rich push notification
await otpService.generateAndSend('device_token_123', 'push', {
  push: {
    title: '🔐 Login Code',
    body: 'Tap to auto-fill: {otp}',
    actions: [
      { id: 'auto_fill', title: 'Auto Fill', icon: '✅' },
      { id: 'copy', title: 'Copy', icon: '📋' }
    ]
  }
});
```

## 🌐 Multi-Channel Delivery

Send OTP via multiple channels simultaneously:

```javascript
// Send via all channels
const result = await otpService.generateAndSend(
  'user@example.com',
  ['sms', 'email', 'push'],
  {
    sms: { template: 'SMS: Your code is {otp}' },
    email: { subject: 'Email: Verification Code' },
    push: { title: 'Push: Login Code' }
  }
);

console.log('Channels used:', result.channels.length);
console.log('Total cost:', result.totalCost);
```

## 🔧 API Endpoints

### Generate OTP
```bash
POST /otp/generate
Content-Type: application/json

{
  "identifier": "user@example.com",
  "channels": ["sms", "email"],
  "options": {
    "email": { "subject": "Your OTP Code" }
  }
}
```

### Verify OTP
```bash
POST /otp/verify
Content-Type: application/json

{
  "sessionId": "otp_1234567890_abcdef",
  "otp": "123456"
}
```

### Resend OTP
```bash
POST /otp/resend
Content-Type: application/json

{
  "sessionId": "otp_1234567890_abcdef",
  "channels": ["email"]
}
```

### Session Status
```bash
GET /otp/session/otp_1234567890_abcdef
```

### Service Statistics
```bash
GET /stats
```

### Multi-Channel Demo
```bash
POST /demo/multi-channel
Content-Type: application/json

{
  "phone": "+1234567890",
  "email": "user@example.com",
  "deviceToken": "device_token_123"
}
```

## ⚙️ Configuration

```javascript
const otpService = new OTPService({
  otpLength: 6,              // OTP code length
  expiryMinutes: 5,          // Expiry time in minutes
  maxAttempts: 3,            // Maximum verification attempts
  
  // Channel-specific configuration
  sms: {
    provider: 'Your SMS Provider',
    fromNumber: '+1-555-YOUR-NUMBER'
  },
  email: {
    provider: 'Your Email Provider',
    fromEmail: 'noreply@yourapp.com',
    fromName: 'Your App Name'
  },
  push: {
    provider: 'Your Push Provider',
    appName: 'Your Mobile App'
  }
});
```

## 🎯 Demo Script Features

Run `npm run demo` to see all features in action:

1. **SMS Channel Demo** - Generate and verify SMS OTP
2. **Email Channel Demo** - Rich HTML email with verification
3. **Push Channel Demo** - Push notification with custom actions
4. **Multi-Channel Demo** - Send via all channels simultaneously
5. **Resend Demo** - Resend OTP via different channel
6. **Max Attempts Demo** - Rate limiting protection
7. **Statistics Demo** - Service usage statistics

## 🔒 Security Features

- **Cryptographically Secure**: Uses Node.js crypto module for OTP generation
- **Time-Limited**: OTPs expire automatically
- **Attempt Limiting**: Maximum verification attempts protection
- **Session Isolation**: Each OTP has unique session identifier
- **Auto Cleanup**: Expired sessions are automatically cleaned up

## 📊 Monitoring & Analytics

Track service performance with built-in statistics:

```javascript
const stats = otpService.getStats();
console.log({
  totalSessions: stats.totalSessions,
  activeSessions: stats.activeSessions,
  verifiedSessions: stats.verifiedSessions,
  channels: stats.channels
});
```

## 🧪 Testing

The service includes comprehensive demo scenarios:

- Successful verification flows
- Error handling (expired OTP, max attempts)
- Multi-channel delivery
- Resend functionality
- Session management

## 🚀 Production Considerations

This is a **demo service**. For production use, consider:

- Replace in-memory storage with Redis/Database
- Implement real SMS/Email/Push providers
- Add authentication and rate limiting
- Implement proper logging and monitoring
- Add input validation and sanitization
- Use environment variables for configuration
- Implement proper error handling and retries

## 📝 License

MIT License - This is a demo project for educational purposes.

## 🤝 Contributing

This is a demo project, but feel free to suggest improvements or use it as a starting point for your own OTP service implementation.

---

**Note**: This service simulates actual SMS, email, and push notification delivery for demonstration purposes. In a production environment, you would integrate with real service providers like Twilio (SMS), SendGrid (Email), and Firebase Cloud Messaging (Push).
