import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\+?[1-9]\d{1,14}$/
  },
  username: { 
    type: String, 
    unique: true, 
    sparse: true,
    minlength: 3,
    maxlength: 32
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 70 },
  avatarUrl: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'dark' },
    language: { type: String, default: 'en' },
    notificationsEnabled: { type: Boolean, default: true },
    privacySettings: {
      showPhoneNumber: { type: Boolean, default: false },
      showLastSeen: { type: Boolean, default: true },
      allowCallsFrom: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' }
    }
  },
  contacts: [{
    userId: { type: String, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  blockedUsers: [{ type: String, ref: 'User' }],
  verificationCode: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false },
    attempts: { type: Number, default: 0, select: false }
  },
  refreshToken: { type: String, select: false },
  deviceInfo: [{
    deviceId: String,
    deviceName: String,
    platform: String,
    lastActiveAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastSeen: -1 });
userSchema.index({ isOnline: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  const names = [this.firstName, this.lastName].filter(Boolean);
  return names.length > 0 ? names.join(' ') : this.phoneNumber;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = await bcrypt.hash(this.refreshToken, 10);
  }
  next();
});

// Method to compare refresh token
userSchema.methods.compareRefreshToken = async function(token) {
  if (!this.refreshToken) return false;
  return bcrypt.compare(token, this.refreshToken);
};

// Method to check if premium is active
userSchema.methods.isPremiumActive = function() {
  if (!this.isPremium || !this.premiumExpiresAt) return false;
  return this.premiumExpiresAt > new Date();
};

// Static method to find users by phone prefix for contacts
userSchema.statics.findByPhonePrefix = function(prefix, limit = 50) {
  return this.find({ 
    phoneNumber: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    settings: { privacySettings: { showPhoneNumber: true } }
  }).limit(limit).select('phoneNumber firstName lastName avatarUrl');
};

export const User = mongoose.model('User', userSchema);
