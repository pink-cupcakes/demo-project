/**
 * SMS Channel Service
 * Simulates SMS delivery for demo purposes
 */
export class SMSChannel {
  constructor(config = {}) {
    this.name = 'SMS';
    this.config = {
      provider: config.provider || 'Demo SMS Provider',
      fromNumber: config.fromNumber || '+1-555-DEMO',
      ...config
    };
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code to send
   * @param {object} options - Additional options
   * @returns {Promise<object>} Delivery result
   */
  async send(phoneNumber, otp, options = {}) {
    // Simulate API call delay
    await this.simulateDelay();

    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    const message = options.template || `Your OTP code is: ${otp}. Valid for 5 minutes.`;
    
    // Simulate SMS sending
    const deliveryId = this.generateDeliveryId();
    
    console.log(`📱 SMS sent to ${phoneNumber}`);
    console.log(`   Message: ${message}`);
    console.log(`   Provider: ${this.config.provider}`);
    console.log(`   Delivery ID: ${deliveryId}`);
    
    return {
      success: true,
      channel: this.name,
      deliveryId,
      recipient: phoneNumber,
      sentAt: new Date().toISOString(),
      provider: this.config.provider,
      cost: 0.05 // Demo cost in USD
    };
  }

  /**
   * Check delivery status (simulated)
   * @param {string} deliveryId - Delivery ID to check
   * @returns {Promise<object>} Status result
   */
  async getDeliveryStatus(deliveryId) {
    await this.simulateDelay(500);
    
    // Simulate different delivery statuses
    const statuses = ['delivered', 'pending', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      deliveryId,
      status: randomStatus,
      deliveredAt: randomStatus === 'delivered' ? new Date().toISOString() : null,
      attempts: Math.floor(Math.random() * 3) + 1
    };
  }

  /**
   * Basic phone number validation
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Is valid
   */
  isValidPhoneNumber(phoneNumber) {
    // Simple regex for demo purposes
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[-\s\(\)]/g, ''));
  }

  /**
   * Generate a random delivery ID
   * @returns {string} Delivery ID
   */
  generateDeliveryId() {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simulate network delay
   * @param {number} ms - Delay in milliseconds
   */
  async simulateDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
