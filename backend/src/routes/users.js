import { Router } from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = Router();

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-verificationCode -refreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
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
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/users/me
 * Update current user profile
 */
router.put('/me', authenticate, [
  body('username').optional().isLength({ min: 3, max: 32 }).withMessage('Username must be 3-32 characters'),
  body('firstName').optional().isLength({ max: 50 }).withMessage('First name too long'),
  body('lastName').optional().isLength({ max: 50 }).withMessage('Last name too long'),
  body('bio').optional().isLength({ max: 70 }).withMessage('Bio too long')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { username, firstName, lastName, bio, avatarUrl, settings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check username uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (settings !== undefined) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/search
 * Search users by username or phone number
 */
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: new RegExp(query, 'i') },
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ],
      'settings.privacySettings.showPhoneNumber': true
    })
    .limit(parseInt(limit))
    .select('username firstName lastName avatarUrl isOnline lastSeen');

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-verificationCode -refreshToken -settings.privacySettings');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    const currentUserId = req.user.userId;
    if (user.settings?.privacySettings?.showLastSeen === false && user._id.toString() !== currentUserId) {
      user.lastSeen = null;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeen: user.settings?.privacySettings?.showLastSeen !== false ? user.lastSeen : null,
        isPremium: user.isPremiumActive()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/users/:userId/block
 * Block a user
 */
router.post('/:userId/block', authenticate, async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser.blockedUsers.includes(userId)) {
      currentUser.blockedUsers.push(userId);
      await currentUser.save();
    }

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/users/:userId/block
 * Unblock a user
 */
router.delete('/:userId/block', authenticate, async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userId);
    await currentUser.save();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
