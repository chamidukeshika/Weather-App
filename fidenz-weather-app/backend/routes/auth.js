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
  from: 'chamidukeshikaz@gmail.com',
  to: email,
  subject: 'Your MFA Verification Code',
  html: `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f6f8; padding: 40px 20px;">
      <div style="background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <!-- Logo / Title -->
        <h2 style="color: #0d6efd; text-align: center; font-size: 24px; margin-bottom: 10px;">🌤️ Weather App</h2>
        <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 0;">Secure Account Verification</p>
        
        <!-- Divider -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <!-- Message -->
        <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
          Your verification code is:
        </p>

        <!-- Code Box -->
        <div style="background: #0d6efd; color: #fff; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        
        <!-- Info -->
        <p style="color: #555; font-size: 14px; line-height: 1.6; text-align: center;">
          This code will expire in <strong>10 minutes</strong>.<br>
          If you didn’t request this, please ignore this email.
        </p>
        
        <!-- Security Note -->
        <div style="background: #f8f9fa; padding: 12px; border-left: 4px solid #0d6efd; border-radius: 6px; font-size: 13px; color: #6c757d; margin-top: 25px;">
          🔒 Never share this code with anyone. Our team will never ask for it.
        </div>
        
      </div>
      
      <!-- Footer -->
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        © 2025 Weather App. All rights reserved.
      </p>
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

    // Check MFA
    const mfaData = mfaCodes.get(email);
    if (!mfaData || mfaData.code !== code) {
      return res.status(401).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    if (Date.now() > mfaData.expiresAt) {
      mfaCodes.delete(email);
      return res.status(401).json({
        success: false,
        error: 'Verification code has expired'
      });
    }

    const user = testUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Clean up used MFA code
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

// ✅ Verify token endpoint (moved OUTSIDE verify-mfa)
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
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