const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Add this dependency

const router = express.Router();

const testUsers = [
  {
    id: 1,
    email: 'careers@fidenz.com',
    password: '$2b$10$HOVJXZ6n5YI/Sj8QWwABju79vZ5YNnJAH7WzrzvszNE1DiLPx2.1K', // Pass#fidenz
    name: 'Fidenz Test User',
    verified: true
  },
  {
    id: 2,
    email: 'chamidukeshikaz@gmail.com',
    password: '$2b$10$Xfer3jlc5wD1YJoQ27MeXOg7xnJxcird0JwL7F2uK947.pLapOPAC', // 123
    name: 'Chamidu',
    verified: true
  }
];

// Add email configuration (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user:'chamidukeshikaz@gmail.com',
    pass:'rwvdstrsmviepehw'
  }
});

// Add temporary storage for MFA codes (use Redis in production)
const mfaCodes = new Map();

// Generate and send MFA code
async function sendMFACode(email) {
  const code = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
  
  // Store code with expiration
  mfaCodes.set(email, { code, expiresAt });
  
  // Send email
  const mailOptions = {
    from:'chamidukeshikaz@gmail.com',
    to: email,
    subject: 'Your MFA Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weather App Verification Code</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return true;
}

// Update login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); // Add logging

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = testUsers.find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Send MFA code instead of generating token
    console.log('Sending MFA code to:', email);
    await sendMFACode(email);
    
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      requiresMFA: true
    });

  } catch (error) {
    console.error('Login error details:', error); // Detailed logging
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});
// Add MFA verification endpoint
router.post('/verify-mfa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required'
      });
    }

    // Check if code exists and is valid
    const mfaData = mfaCodes.get(email);
    if (!mfaData || mfaData.code !== code) {
      return res.status(401).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Check if code has expired
    if (Date.now() > mfaData.expiresAt) {
      mfaCodes.delete(email); // Clean up expired code
      return res.status(401).json({
        success: false,
        error: 'Verification code has expired'
      });
    }

    // Find user
    const user = testUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Clean up used code
    mfaCodes.delete(email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Add resend code endpoint
router.post('/resend-mfa', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    const user = testUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Send new MFA code
    await sendMFACode(email);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email'
    });

  } catch (error) {
    console.error('Resend MFA error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend code',
      message: error.message
    });
  }
});

module.exports = router;