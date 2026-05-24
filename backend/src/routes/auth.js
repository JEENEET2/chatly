import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/v1/auth/send-code
 * Send verification code to phone number
 */
router.post('/send-code', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const result = await authService.sendVerificationCode(phoneNumber);

    res.json({
      success: true,
      message: 'Verification code sent',
      phoneCodeHash: result.phoneCodeHash,
      timeout: result.timeout
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/verify-code
 * Verify code and login/register
 */
router.post('/verify-code', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('code')
    .isLength({ min: 5, max: 10 })
    .withMessage('Invalid verification code'),
  body('phoneCodeHash')
    .optional()
    .isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, code, phoneCodeHash } = req.body;
    const result = await authService.verifyCode(phoneNumber, code, phoneCodeHash);

    res.json({
      success: true,
      message: 'Authentication successful',
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    await authService.logout(userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
