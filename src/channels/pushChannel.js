/**
 * Push Notification Channel Service
 * Simulates push notification delivery for demo purposes
 */
export class PushChannel {
  constructor(config = {}) {
    this.name = 'Push';
    this.config = {
      provider: config.provider || 'Demo Push Provider',
      appName: config.appName || 'Demo OTP App',
      ...config
    };
  }

  /**
   * Send OTP via Push Notification
   * @param {string} deviceToken - Recipient device token
   * @param {string} otp - OTP code to send
   * @param {object} options - Additional options
   * @returns {Promise<object>} Delivery result
   */
  async send(deviceToken, otp, options = {}) {
    // Simulate API call delay
    await this.simulateDelay();

    // Validate device token format
    if (!this.isValidDeviceToken(deviceToken)) {
      throw new Error('Invalid device token format');
    }

    const title = options.title || '🔐 OTP Code';
    const body = options.body || `Your verification code is: ${otp}`;
    const badge = options.badge || 1;
    const sound = options.sound || 'default';
    const priority = options.priority || 'high';
    
    // Simulate push notification sending
    const deliveryId = this.generateDeliveryId();
    const deviceInfo = this.parseDeviceToken(deviceToken);
    
    console.log(`📱 Push notification sent to ${deviceInfo.platform} device`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);
    console.log(`   Device: ${deviceToken.substring(0, 12)}...${deviceToken.substring(deviceToken.length - 8)}`);
    console.log(`   Provider: ${this.config.provider}`);
    console.log(`   Delivery ID: ${deliveryId}`);
    console.log(`   Priority: ${priority}`);
    
    return {
      success: true,
      channel: this.name,
      deliveryId,
      recipient: deviceToken,
      sentAt: new Date().toISOString(),
      provider: this.config.provider,
      platform: deviceInfo.platform,
      title,
      body,
      priority,
      cost: 0.001 // Demo cost in USD
    };
  }

  /**
   * Send rich push notification with custom data
   * @param {string} deviceToken - Recipient device token
   * @param {string} otp - OTP code to send
   * @param {object} options - Rich notification options
   * @returns {Promise<object>} Delivery result
   */
  async sendRich(deviceToken, otp, options = {}) {
    const richOptions = {
      title: options.title || '🔐 Secure Login',
      body: options.body || `Tap to auto-fill code: ${otp}`,
      badge: options.badge || 1,
      sound: options.sound || 'default',
      priority: 'high',
      category: 'OTP_VERIFICATION',
      customData: {
        otpCode: otp,
        expiresIn: 300, // 5 minutes
        action: 'auto_fill',
        ...options.customData
      },
      actions: [
        {
          id: 'auto_fill',
          title: 'Auto Fill',
          icon: '✅'
        },
        {
          id: 'copy',
          title: 'Copy Code',
          icon: '📋'
        }
      ]
    };

    return await this.send(deviceToken, otp, richOptions);
  }

  /**
   * Check delivery status (simulated)
   * @param {string} deliveryId - Delivery ID to check
   * @returns {Promise<object>} Status result
   */
  async getDeliveryStatus(deliveryId) {
    await this.simulateDelay(500);
    
    // Simulate different delivery statuses
    const statuses = ['delivered', 'clicked', 'dismissed', 'failed'];
    const weights = [0.6, 0.25, 0.1, 0.05]; // Weighted probabilities
    const randomStatus = this.weightedRandom(statuses, weights);
    
    return {
      deliveryId,
      status: randomStatus,
      deliveredAt: ['delivered', 'clicked', 'dismissed'].includes(randomStatus) ? new Date().toISOString() : null,
      clickedAt: randomStatus === 'clicked' ? new Date().toISOString() : null,
      attempts: Math.floor(Math.random() * 2) + 1,
      deviceOnline: Math.random() > 0.1 // 90% chance device is online
    };
  }

  /**
   * Validate device token format (simplified)
   * @param {string} deviceToken - Device token to validate
   * @returns {boolean} Is valid
   */
  isValidDeviceToken(deviceToken) {
    // Simple validation - should be a string with reasonable length
    return typeof deviceToken === 'string' && 
           deviceToken.length >= 32 && 
           deviceToken.length <= 256 &&
           /^[a-zA-Z0-9_-]+$/.test(deviceToken);
  }

  /**
   * Parse device token to extract platform info (simulated)
   * @param {string} deviceToken - Device token
   * @returns {object} Device info
   */
  parseDeviceToken(deviceToken) {
    // Simulate platform detection based on token characteristics
    const platforms = ['iOS', 'Android', 'Web'];
    const platformIndex = deviceToken.charCodeAt(0) % platforms.length;
    
    return {
      platform: platforms[platformIndex],
      tokenType: deviceToken.length > 100 ? 'FCM' : 'APNS',
      isValid: true
    };
  }

  /**
   * Generate a random delivery ID
   * @returns {string} Delivery ID
   */
  generateDeliveryId() {
    return `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Weighted random selection
   * @param {Array} items - Items to choose from
   * @param {Array} weights - Weights for each item
   * @returns {*} Selected item
   */
  weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  /**
   * Simulate network delay
   * @param {number} ms - Delay in milliseconds
   */
  async simulateDelay(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Bulk send push notifications
   * @param {Array} recipients - Array of {deviceToken, otp} objects
   * @param {object} options - Shared options for all notifications
   * @returns {Promise<Array>} Array of delivery results
   */
  async sendBulk(recipients, options = {}) {
    console.log(`📱 Sending bulk push notifications to ${recipients.length} devices...`);
    
    const promises = recipients.map(async (recipient, index) => {
      // Add slight delay between sends to simulate rate limiting
      await this.simulateDelay(index * 100);
      return await this.send(recipient.deviceToken, recipient.otp, options);
    });

    return Promise.all(promises);
  }
}
