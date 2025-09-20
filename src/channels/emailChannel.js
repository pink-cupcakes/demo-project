/**
 * Email Channel Service
 * Simulates email delivery for demo purposes
 */
export class EmailChannel {
  constructor(config = {}) {
    this.name = 'Email';
    this.config = {
      provider: config.provider || 'Demo Email Provider',
      fromEmail: config.fromEmail || 'noreply@demo-otp.com',
      fromName: config.fromName || 'Demo OTP Service',
      ...config
    };
  }

  /**
   * Send OTP via Email
   * @param {string} email - Recipient email address
   * @param {string} otp - OTP code to send
   * @param {object} options - Additional options
   * @returns {Promise<object>} Delivery result
   */
  async send(email, otp, options = {}) {
    // Simulate API call delay
    await this.simulateDelay();

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address format');
    }

    const subject = options.subject || 'Your OTP Code';
    const htmlTemplate = options.htmlTemplate || this.getDefaultHTMLTemplate(otp);
    const textTemplate = options.textTemplate || this.getDefaultTextTemplate(otp);
    
    // Simulate email sending
    const deliveryId = this.generateDeliveryId();
    
    console.log(`📧 Email sent to ${email}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${this.config.fromName} <${this.config.fromEmail}>`);
    console.log(`   Provider: ${this.config.provider}`);
    console.log(`   Delivery ID: ${deliveryId}`);
    console.log(`   Content Preview: Your OTP code is: ${otp}`);
    
    return {
      success: true,
      channel: this.name,
      deliveryId,
      recipient: email,
      sentAt: new Date().toISOString(),
      provider: this.config.provider,
      subject,
      cost: 0.01 // Demo cost in USD
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
    const statuses = ['delivered', 'opened', 'bounced', 'pending'];
    const weights = [0.7, 0.2, 0.05, 0.05]; // Weighted probabilities
    const randomStatus = this.weightedRandom(statuses, weights);
    
    return {
      deliveryId,
      status: randomStatus,
      deliveredAt: ['delivered', 'opened'].includes(randomStatus) ? new Date().toISOString() : null,
      openedAt: randomStatus === 'opened' ? new Date().toISOString() : null,
      attempts: Math.floor(Math.random() * 2) + 1
    };
  }

  /**
   * Get default HTML email template
   * @param {string} otp - OTP code
   * @returns {string} HTML template
   */
  getDefaultHTMLTemplate(otp) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔐 OTP Verification</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Your one-time password (OTP) code is:
          </p>
          <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            ⏰ This code will expire in <strong>5 minutes</strong><br>
            🔒 For security, do not share this code with anyone
          </p>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from Demo OTP Service
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Get default text email template
   * @param {string} otp - OTP code
   * @returns {string} Text template
   */
  getDefaultTextTemplate(otp) {
    return `
Your OTP Code: ${otp}

This code will expire in 5 minutes.
For security, do not share this code with anyone.

---
Demo OTP Service
    `.trim();
  }

  /**
   * Email validation
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate a random delivery ID
   * @returns {string} Delivery ID
   */
  generateDeliveryId() {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  async simulateDelay(ms = 1200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
