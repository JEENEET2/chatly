import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chatly-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';
const REFRESH_TOKEN_EXPIRES_IN = '90d';

export class AuthService {
  /**
   * Generate JWT access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user._id, 
        phoneNumber: user.phoneNumber,
        isPremium: user.isPremium 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken() {
    return jwt.sign(
      { random: Math.random().toString(36).substring(2) },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Send verification code (in production, integrate with SMS provider)
   */
  async sendVerificationCode(phoneNumber) {
    // In production, integrate with Twilio, Firebase Auth, or similar
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store code in database (would use Redis in production for better performance)
    await User.findOneAndUpdate(
      { phoneNumber },
      {
        $set: {
          'verificationCode.code': code,
          'verificationCode.expiresAt': expiresAt,
          'verificationCode.attempts': 0
        }
      },
      { upsert: true, new: true }
    );

    // Log code for development (remove in production)
    console.log(`[DEV] Verification code for ${phoneNumber}: ${code}`);

    // TODO: Integrate with SMS provider
    // await smsProvider.send(phoneNumber, `Your Chatly verification code is: ${code}`);

    return {
      phoneCodeHash: Buffer.from(`${phoneNumber}:${code}`).toString('base64'),
      timeout: 300
    };
  }

  /**
   * Verify code and create/login user
   */
  async verifyCode(phoneNumber, code, phoneCodeHash) {
    let user = await User.findOne({ phoneNumber }).select('+verificationCode.code +verificationCode.expiresAt +verificationCode.attempts');

    if (!user) {
      // Create new user
      user = new User({ phoneNumber });
      await user.save();
    }

    // Check verification code
    if (!user.verificationCode?.code) {
      throw new Error('No verification code sent. Please request a new code.');
    }

    if (user.verificationCode.expiresAt < new Date()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (user.verificationCode.code !== code) {
      user.verificationCode.attempts += 1;
      
      if (user.verificationCode.attempts >= 5) {
        throw new Error('Too many failed attempts. Please request a new code.');
      }
      
      await user.save();
      throw new Error('Invalid verification code.');
    }

    // Clear verification code
    user.verificationCode = undefined;
    
    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: this.sanitizeUser(user),
      token,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      const user = await User.findOne({ refreshToken }).select('+refreshToken');
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken();
      
      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      lastSeen: new Date()
    });
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-verificationCode -refreshToken');
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Sanitize user object for response
   */
  sanitizeUser(user) {
    return {
      id: user._id,
      phoneNumber: user.phoneNumber,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isPremium: user.isPremiumActive(),
      premiumExpiresAt: user.premiumExpiresAt,
      settings: user.settings,
      createdAt: user.createdAt
    };
  }
}

export default AuthService;
