import crypto from 'crypto';

/**
 * OTP Generator utility class
 */
export class OTPGenerator {
  /**
   * Generate a random OTP code
   * @param {number} length - Length of the OTP (default: 6)
   * @param {boolean} alphanumeric - Include letters (default: false, numbers only)
   * @returns {string} Generated OTP
   */
  static generate(length = 6, alphanumeric = false) {
    if (alphanumeric) {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += chars[crypto.randomInt(0, chars.length)];
      }
      return otp;
    } else {
      // Generate numeric OTP
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      return crypto.randomInt(min, max + 1).toString();
    }
  }

  /**
   * Generate OTP with expiration time
   * @param {number} length - Length of the OTP
   * @param {number} expiryMinutes - Expiry time in minutes (default: 5)
   * @returns {object} Object with otp and expiresAt
   */
  static generateWithExpiry(length = 6, expiryMinutes = 5) {
    const otp = this.generate(length);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    return {
      otp,
      expiresAt
    };
  }
}
