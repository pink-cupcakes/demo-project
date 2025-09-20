import { OTPGenerator } from './utils/otpGenerator.js';
import { SMSChannel } from './channels/smsChannel.js';
import { EmailChannel } from './channels/emailChannel.js';
import { PushChannel } from './channels/pushChannel.js';

/**
 * Main OTP Service that coordinates all communication channels
 */
export class OTPService {
  constructor(config = {}) {
    this.config = {
      otpLength: config.otpLength || 6,
      expiryMinutes: config.expiryMinutes || 5,
      maxAttempts: config.maxAttempts || 3,
      ...config
    };

    // Initialize channels
    this.channels = {
      sms: new SMSChannel(config.sms || {}),
      email: new EmailChannel(config.email || {}),
      push: new PushChannel(config.push || {})
    };

    // In-memory storage for demo (in production, use Redis/Database)
    this.otpStore = new Map();
    this.attemptStore = new Map();
  }

  /**
   * Generate and send OTP via specified channel(s)
   * @param {string} identifier - User identifier (phone, email, deviceToken)
   * @param {string|Array} channels - Channel name(s) to use
   * @param {object} options - Additional options
   * @returns {Promise<object>} Generation result
   */
  async generateAndSend(identifier, channels = 'sms', options = {}) {
    // Generate OTP with expiry
    const otpData = OTPGenerator.generateWithExpiry(
      this.config.otpLength,
      this.config.expiryMinutes
    );

    // Create session ID for tracking
    const sessionId = this.generateSessionId();
    
    // Store OTP data
    this.otpStore.set(sessionId, {
      ...otpData,
      identifier,
      channels: Array.isArray(channels) ? channels : [channels],
      createdAt: new Date().toISOString(),
      verified: false
    });

    // Initialize attempt counter
    this.attemptStore.set(sessionId, 0);

    console.log(`\n🔐 OTP Generation Started`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   OTP: ${otpData.otp}`);
    console.log(`   Expires: ${otpData.expiresAt.toISOString()}`);
    console.log(`   Channels: ${Array.isArray(channels) ? channels.join(', ') : channels}`);

    // Send via all specified channels
    const channelArray = Array.isArray(channels) ? channels : [channels];
    const sendResults = [];

    for (const channelName of channelArray) {
      try {
        const result = await this.sendViaChannel(channelName, identifier, otpData.otp, options);
        sendResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to send via ${channelName}:`, error.message);
        sendResults.push({
          success: false,
          channel: channelName,
          error: error.message
        });
      }
    }

    return {
      success: sendResults.some(r => r.success),
      sessionId,
      otp: otpData.otp, // Only for demo - don't return in production!
      expiresAt: otpData.expiresAt,
      channels: sendResults,
      totalCost: sendResults.reduce((sum, r) => sum + (r.cost || 0), 0)
    };
  }

  /**
   * Verify OTP code
   * @param {string} sessionId - Session ID from generation
   * @param {string} inputOtp - OTP code to verify
   * @returns {Promise<object>} Verification result
   */
  async verify(sessionId, inputOtp) {
    console.log(`\n🔍 OTP Verification Attempt`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Input OTP: ${inputOtp}`);

    // Check if session exists
    if (!this.otpStore.has(sessionId)) {
      return {
        success: false,
        error: 'Invalid session ID',
        code: 'INVALID_SESSION'
      };
    }

    const otpData = this.otpStore.get(sessionId);
    const attempts = this.attemptStore.get(sessionId) || 0;

    // Check if already verified
    if (otpData.verified) {
      return {
        success: false,
        error: 'OTP already used',
        code: 'ALREADY_USED'
      };
    }

    // Check max attempts
    if (attempts >= this.config.maxAttempts) {
      console.log(`   ❌ Max attempts (${this.config.maxAttempts}) exceeded`);
      this.otpStore.delete(sessionId);
      this.attemptStore.delete(sessionId);
      return {
        success: false,
        error: `Maximum attempts (${this.config.maxAttempts}) exceeded`,
        code: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    // Check if expired
    if (new Date() > new Date(otpData.expiresAt)) {
      console.log(`   ❌ OTP expired at ${otpData.expiresAt}`);
      this.otpStore.delete(sessionId);
      this.attemptStore.delete(sessionId);
      return {
        success: false,
        error: 'OTP has expired',
        code: 'EXPIRED'
      };
    }

    // Increment attempt counter
    this.attemptStore.set(sessionId, attempts + 1);

    // Verify OTP
    if (inputOtp === otpData.otp) {
      console.log(`   ✅ OTP verified successfully`);
      
      // Mark as verified
      otpData.verified = true;
      otpData.verifiedAt = new Date().toISOString();
      this.otpStore.set(sessionId, otpData);

      return {
        success: true,
        verifiedAt: otpData.verifiedAt,
        attemptsUsed: attempts + 1,
        identifier: otpData.identifier
      };
    } else {
      console.log(`   ❌ Invalid OTP (attempt ${attempts + 1}/${this.config.maxAttempts})`);
      return {
        success: false,
        error: 'Invalid OTP code',
        code: 'INVALID_CODE',
        attemptsRemaining: this.config.maxAttempts - (attempts + 1)
      };
    }
  }

  /**
   * Send OTP via specific channel
   * @param {string} channelName - Channel to use
   * @param {string} identifier - Recipient identifier
   * @param {string} otp - OTP code
   * @param {object} options - Channel-specific options
   * @returns {Promise<object>} Send result
   */
  async sendViaChannel(channelName, identifier, otp, options = {}) {
    const channel = this.channels[channelName.toLowerCase()];
    
    if (!channel) {
      throw new Error(`Unknown channel: ${channelName}`);
    }

    return await channel.send(identifier, otp, options[channelName] || {});
  }

  /**
   * Get OTP session status
   * @param {string} sessionId - Session ID to check
   * @returns {object} Session status
   */
  getSessionStatus(sessionId) {
    if (!this.otpStore.has(sessionId)) {
      return {
        exists: false,
        error: 'Session not found'
      };
    }

    const otpData = this.otpStore.get(sessionId);
    const attempts = this.attemptStore.get(sessionId) || 0;
    const isExpired = new Date() > new Date(otpData.expiresAt);

    return {
      exists: true,
      sessionId,
      identifier: otpData.identifier,
      channels: otpData.channels,
      createdAt: otpData.createdAt,
      expiresAt: otpData.expiresAt,
      verified: otpData.verified,
      verifiedAt: otpData.verifiedAt || null,
      attempts,
      maxAttempts: this.config.maxAttempts,
      attemptsRemaining: Math.max(0, this.config.maxAttempts - attempts),
      isExpired,
      status: otpData.verified ? 'verified' : 
              isExpired ? 'expired' : 
              attempts >= this.config.maxAttempts ? 'max_attempts_exceeded' : 
              'pending'
    };
  }

  /**
   * Resend OTP using the same session
   * @param {string} sessionId - Original session ID
   * @param {string|Array} channels - Channel(s) to resend via
   * @returns {Promise<object>} Resend result
   */
  async resend(sessionId, channels = null) {
    const sessionStatus = this.getSessionStatus(sessionId);
    
    if (!sessionStatus.exists) {
      throw new Error('Session not found');
    }

    if (sessionStatus.verified) {
      throw new Error('Cannot resend - OTP already verified');
    }

    if (sessionStatus.isExpired) {
      throw new Error('Cannot resend - OTP session expired');
    }

    const otpData = this.otpStore.get(sessionId);
    const channelsToUse = channels || otpData.channels;
    
    console.log(`\n🔄 OTP Resend Request`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Channels: ${Array.isArray(channelsToUse) ? channelsToUse.join(', ') : channelsToUse}`);

    // Send via specified channels
    const channelArray = Array.isArray(channelsToUse) ? channelsToUse : [channelsToUse];
    const sendResults = [];

    for (const channelName of channelArray) {
      try {
        const result = await this.sendViaChannel(channelName, otpData.identifier, otpData.otp, {});
        sendResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to resend via ${channelName}:`, error.message);
        sendResults.push({
          success: false,
          channel: channelName,
          error: error.message
        });
      }
    }

    return {
      success: sendResults.some(r => r.success),
      sessionId,
      channels: sendResults,
      totalCost: sendResults.reduce((sum, r) => sum + (r.cost || 0), 0)
    };
  }

  /**
   * Clean up expired sessions
   * @returns {number} Number of cleaned sessions
   */
  cleanupExpiredSessions() {
    let cleaned = 0;
    const now = new Date();

    for (const [sessionId, otpData] of this.otpStore.entries()) {
      if (now > new Date(otpData.expiresAt)) {
        this.otpStore.delete(sessionId);
        this.attemptStore.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired OTP sessions`);
    }

    return cleaned;
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `otp_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Get service statistics
   * @returns {object} Service stats
   */
  getStats() {
    const now = new Date();
    let active = 0;
    let expired = 0;
    let verified = 0;

    for (const [sessionId, otpData] of this.otpStore.entries()) {
      if (otpData.verified) {
        verified++;
      } else if (now > new Date(otpData.expiresAt)) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      totalSessions: this.otpStore.size,
      activeSessions: active,
      expiredSessions: expired,
      verifiedSessions: verified,
      channels: Object.keys(this.channels),
      config: {
        otpLength: this.config.otpLength,
        expiryMinutes: this.config.expiryMinutes,
        maxAttempts: this.config.maxAttempts
      }
    };
  }
}
