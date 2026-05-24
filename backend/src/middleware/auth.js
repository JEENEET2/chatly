import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chatly-dev-secret-change-in-production';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists
    User.findById(decoded.userId).then(user => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not found'
        });
      }
      req.user = decoded;
      next();
    }).catch(next);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
}

export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Token invalid, but continue without user context
    next();
  }
}
