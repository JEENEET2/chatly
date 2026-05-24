import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const messageSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  chatId: { type: String, ref: 'Chat', required: true, index: true },
  senderId: { type: String, ref: 'User', required: true },
  content: {
    text: { type: String, maxlength: 4096 },
    media: [{
      type: { type: String, enum: ['photo', 'video', 'audio', 'document', 'voice'] },
      url: { type: String, required: true },
      thumbnailUrl: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      duration: { type: Number }, // For audio/video in seconds
      width: { type: Number }, // For images/video
      height: { type: Number } // For images/video
    }],
    replyToMessageId: { type: String },
    forwardFromMessageId: { type: String },
    forwardFromChatId: { type: String },
    forwardFromUserId: { type: String },
    caption: { type: String, maxlength: 1024 }
  },
  reactions: [{
    userId: { type: String, ref: 'User' },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  mentions: [{
    userId: { type: String, ref: 'User' },
    offset: { type: Number },
    length: { type: Number }
  }],
  type: { 
    type: String, 
    enum: ['text', 'media', 'system', 'service'], 
    default: 'text' 
  },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  readBy: [{
    userId: { type: String, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  scheduleAt: { type: Date }, // For scheduled messages
  ttl: { type: Number, default: 0 }, // Time-to-live for self-destructing messages
  encryptionKey: { type: String, select: false } // For secret chats
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ 'content.replyToMessageId': 1 });
messageSchema.index({ scheduleAt: 1 }, { sparse: true });

// Virtual for reaction count by emoji
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions?.forEach(r => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });
  return counts;
});

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existing = this.reactions.find(r => r.userId === userId && r.emoji === emoji);
  if (!existing) {
    this.reactions.push({ userId, emoji });
  }
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.userId === userId && r.emoji === emoji)
  );
  return this.save();
};

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existing = this.readBy.find(r => r.userId === userId);
  if (!existing) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  this.deliveryStatus = 'read';
  return this.save();
};

// Static method to get messages for a chat with pagination
chatSchema.statics.findByChatId = function(chatId, options = {}) {
  const { limit = 50, skip = 0, before, after } = options;
  
  let query = { chatId, isDeleted: false };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'firstName lastName avatarUrl username isOnline')
    .populate('content.forwardFromUserId', 'firstName lastName username');
};

// Static method to delete messages older than TTL
chatSchema.statics.deleteExpiredMessages = async function() {
  const now = new Date();
  const result = await this.deleteMany({
    ttl: { $gt: 0 },
    createdAt: { $lte: new Date(now.getTime() - (this.ttl * 1000)) }
  });
  return result;
};

export const Message = mongoose.model('Message', messageSchema);
