#!/usr/bin/env node

/**
 * OTP Service Demo Script
 * Demonstrates all features of the OTP service
 */

import { OTPService } from './src/otpService.js';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  header('🔐 OTP SERVICE DEMO');
  
  // Initialize OTP Service
  log('\n📋 Initializing OTP Service...', colors.yellow);
  
  const otpService = new OTPService({
    otpLength: 6,
    expiryMinutes: 5,
    maxAttempts: 3,
    sms: {
      provider: 'Demo SMS Gateway Pro',
      fromNumber: '+1-555-OTP-DEMO'
    },
    email: {
      provider: 'Demo Email Service Pro',
      fromEmail: 'noreply@otp-demo.com',
      fromName: 'OTP Demo Service'
    },
    push: {
      provider: 'Demo Push Notification Service',
      appName: 'OTP Demo Mobile App'
    }
  });

  log('✅ OTP Service initialized successfully!', colors.green);

  // Demo 1: Single Channel (SMS)
  header('📱 DEMO 1: SMS Channel');
  
  try {
    const smsResult = await otpService.generateAndSend('+1-234-567-8900', 'sms');
    log(`✅ SMS OTP generated: ${smsResult.otp}`, colors.green);
    log(`   Session ID: ${smsResult.sessionId}`, colors.blue);
    log(`   Cost: $${smsResult.totalCost}`, colors.yellow);

    // Wait a moment
    await sleep(1000);

    // Verify the OTP
    log('\n🔍 Verifying SMS OTP...', colors.yellow);
    const smsVerifyResult = await otpService.verify(smsResult.sessionId, smsResult.otp);
    
    if (smsVerifyResult.success) {
      log('✅ SMS OTP verified successfully!', colors.green);
    } else {
      log(`❌ SMS OTP verification failed: ${smsVerifyResult.error}`, colors.red);
    }
  } catch (error) {
    log(`❌ SMS Demo failed: ${error.message}`, colors.red);
  }

  // Demo 2: Email Channel
  header('📧 DEMO 2: Email Channel');
  
  try {
    const emailResult = await otpService.generateAndSend('user@demo.com', 'email');
    log(`✅ Email OTP generated: ${emailResult.otp}`, colors.green);
    log(`   Session ID: ${emailResult.sessionId}`, colors.blue);
    log(`   Cost: $${emailResult.totalCost}`, colors.yellow);

    await sleep(1000);

    // Test wrong OTP first
    log('\n🔍 Testing wrong OTP...', colors.yellow);
    const wrongVerifyResult = await otpService.verify(emailResult.sessionId, '000000');
    log(`❌ Wrong OTP result: ${wrongVerifyResult.error}`, colors.red);
    log(`   Attempts remaining: ${wrongVerifyResult.attemptsRemaining}`, colors.yellow);

    // Then verify with correct OTP
    log('\n🔍 Verifying correct Email OTP...', colors.yellow);
    const emailVerifyResult = await otpService.verify(emailResult.sessionId, emailResult.otp);
    
    if (emailVerifyResult.success) {
      log('✅ Email OTP verified successfully!', colors.green);
    } else {
      log(`❌ Email OTP verification failed: ${emailVerifyResult.error}`, colors.red);
    }
  } catch (error) {
    log(`❌ Email Demo failed: ${error.message}`, colors.red);
  }

  // Demo 3: Push Notification Channel
  header('📲 DEMO 3: Push Notification Channel');
  
  try {
    const deviceToken = 'demo_device_token_' + Math.random().toString(36).substr(2, 20);
    const pushResult = await otpService.generateAndSend(deviceToken, 'push');
    log(`✅ Push OTP generated: ${pushResult.otp}`, colors.green);
    log(`   Session ID: ${pushResult.sessionId}`, colors.blue);
    log(`   Device Token: ${deviceToken.substring(0, 20)}...`, colors.blue);
    log(`   Cost: $${pushResult.totalCost}`, colors.yellow);

    await sleep(1000);

    // Verify the Push OTP
    log('\n🔍 Verifying Push OTP...', colors.yellow);
    const pushVerifyResult = await otpService.verify(pushResult.sessionId, pushResult.otp);
    
    if (pushVerifyResult.success) {
      log('✅ Push OTP verified successfully!', colors.green);
    } else {
      log(`❌ Push OTP verification failed: ${pushVerifyResult.error}`, colors.red);
    }
  } catch (error) {
    log(`❌ Push Demo failed: ${error.message}`, colors.red);
  }

  // Demo 4: Multi-Channel
  header('🌐 DEMO 4: Multi-Channel Delivery');
  
  try {
    const multiResult = await otpService.generateAndSend(
      'multi-user@demo.com',
      ['sms', 'email', 'push'],
      {
        sms: { template: 'Your secure code: {otp}. Expires in 5 min.' },
        email: { subject: 'Multi-Channel OTP Code' }
      }
    );
    
    log(`✅ Multi-channel OTP generated: ${multiResult.otp}`, colors.green);
    log(`   Session ID: ${multiResult.sessionId}`, colors.blue);
    log(`   Channels used: ${multiResult.channels.length}`, colors.yellow);
    log(`   Total cost: $${multiResult.totalCost}`, colors.yellow);
    
    // Show channel breakdown
    multiResult.channels.forEach((channel, index) => {
      if (channel.success) {
        log(`   ✅ ${channel.channel}: ${channel.deliveryId}`, colors.green);
      } else {
        log(`   ❌ ${channel.channel}: ${channel.error}`, colors.red);
      }
    });

    await sleep(1000);

    // Verify multi-channel OTP
    log('\n🔍 Verifying Multi-channel OTP...', colors.yellow);
    const multiVerifyResult = await otpService.verify(multiResult.sessionId, multiResult.otp);
    
    if (multiVerifyResult.success) {
      log('✅ Multi-channel OTP verified successfully!', colors.green);
    } else {
      log(`❌ Multi-channel OTP verification failed: ${multiVerifyResult.error}`, colors.red);
    }
  } catch (error) {
    log(`❌ Multi-channel Demo failed: ${error.message}`, colors.red);
  }

  // Demo 5: Resend Functionality
  header('🔄 DEMO 5: Resend Functionality');
  
  try {
    const resendResult = await otpService.generateAndSend('+1-555-RESEND', 'sms');
    log(`✅ Initial OTP generated: ${resendResult.otp}`, colors.green);
    log(`   Session ID: ${resendResult.sessionId}`, colors.blue);

    await sleep(1000);

    // Resend via different channel
    log('\n🔄 Resending via Email...', colors.yellow);
    const resendViaEmail = await otpService.resend(resendResult.sessionId, 'email');
    
    if (resendViaEmail.success) {
      log('✅ OTP resent via email successfully!', colors.green);
      log(`   Cost: $${resendViaEmail.totalCost}`, colors.yellow);
    } else {
      log(`❌ Resend failed`, colors.red);
    }

    // Check session status
    log('\n📊 Checking session status...', colors.yellow);
    const sessionStatus = otpService.getSessionStatus(resendResult.sessionId);
    log(`   Status: ${sessionStatus.status}`, colors.blue);
    log(`   Attempts: ${sessionStatus.attempts}/${sessionStatus.maxAttempts}`, colors.blue);
    log(`   Channels: ${sessionStatus.channels.join(', ')}`, colors.blue);
  } catch (error) {
    log(`❌ Resend Demo failed: ${error.message}`, colors.red);
  }

  // Demo 6: Max Attempts Exceeded
  header('🚫 DEMO 6: Max Attempts Exceeded');
  
  try {
    const maxAttemptsResult = await otpService.generateAndSend('+1-555-MAXOUT', 'sms');
    log(`✅ OTP for max attempts test: ${maxAttemptsResult.otp}`, colors.green);
    
    // Try wrong OTP multiple times
    for (let i = 1; i <= 4; i++) {
      log(`\n🔍 Attempt ${i}: Trying wrong OTP...`, colors.yellow);
      const attemptResult = await otpService.verify(maxAttemptsResult.sessionId, '999999');
      
      if (attemptResult.code === 'MAX_ATTEMPTS_EXCEEDED') {
        log(`❌ Max attempts exceeded after ${i} tries`, colors.red);
        break;
      } else {
        log(`❌ Wrong OTP (${attemptResult.attemptsRemaining} attempts remaining)`, colors.yellow);
      }
      
      await sleep(500);
    }
  } catch (error) {
    log(`❌ Max Attempts Demo failed: ${error.message}`, colors.red);
  }

  // Demo 7: Service Statistics
  header('📊 DEMO 7: Service Statistics');
  
  const stats = otpService.getStats();
  log('\n📈 Current Service Statistics:', colors.bright);
  log(`   Total Sessions: ${stats.totalSessions}`, colors.blue);
  log(`   Active Sessions: ${stats.activeSessions}`, colors.green);
  log(`   Expired Sessions: ${stats.expiredSessions}`, colors.yellow);
  log(`   Verified Sessions: ${stats.verifiedSessions}`, colors.green);
  log(`   Available Channels: ${stats.channels.join(', ')}`, colors.blue);
  log(`   OTP Length: ${stats.config.otpLength} digits`, colors.blue);
  log(`   Expiry Time: ${stats.config.expiryMinutes} minutes`, colors.blue);
  log(`   Max Attempts: ${stats.config.maxAttempts}`, colors.blue);

  // Cleanup
  log('\n🧹 Cleaning up expired sessions...', colors.yellow);
  const cleaned = otpService.cleanupExpiredSessions();
  log(`✅ Cleaned up ${cleaned} expired sessions`, colors.green);

  // Final summary
  header('🎉 DEMO COMPLETED');
  log('\nDemo showcased the following features:', colors.bright);
  log('✅ SMS OTP generation and verification', colors.green);
  log('✅ Email OTP with HTML templates', colors.green);
  log('✅ Push notification OTP delivery', colors.green);
  log('✅ Multi-channel OTP delivery', colors.green);
  log('✅ OTP resend functionality', colors.green);
  log('✅ Max attempts protection', colors.green);
  log('✅ Session status tracking', colors.green);
  log('✅ Service statistics', colors.green);
  log('✅ Automatic cleanup of expired sessions', colors.green);

  log('\n🚀 To start the API server, run: npm start', colors.cyan);
  log('📖 API documentation available at: http://localhost:3000/', colors.cyan);
  
  console.log('\n' + '='.repeat(60));
}

// Run the demo
runDemo().catch(error => {
  console.error('\n❌ Demo failed:', error);
  process.exit(1);
});
