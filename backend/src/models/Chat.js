import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const chatSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  type: { 
    type: String, 
    enum: ['private', 'group', 'channel', 'secret'], 
    required: true 
  },
  name: { type: String }, // For groups/channels
  description: { type: String, maxlength: 255 }, // For groups/channels
  avatarUrl: { type: String, default: null },
  participants: [{
    userId: { type: String, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['owner', 'admin', 'member'], 
      default: 'member' 
    },
    joinedAt: { type: Date, default: Date.now },
    lastReadMessageId: { type: String },
    isMuted: { type: Boolean, default: false },
    customTitle: { type: String } // Admin custom title in groups
  }],
  createdBy: { type: String, ref: 'User' },
  settings: {
    messagesTTL: { type: Number, default: 0 }, // Auto-delete messages after seconds
    slowModeDelay: { type: Number, default: 0 }, // Seconds between messages
    onlyAdminsCanPost: { type: Boolean, default: false },
    onlyAdminsCanEdit: { type: Boolean, default: false },
    joinRequestsEnabled: { type: Boolean, default: false },
    historyVisibleToNewMembers: { type: Boolean, default: true }
  },
  encryptionKey: { type: String, select: false }, // For secret chats
  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
  pinnedMessageIds: [{ type: String }],
  folderId: { type: String } // For user-defined folders
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'participants.userId': 1 });

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants?.length || 0;
});

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId === userId);
};

// Method to get user's role
chatSchema.methods.getUserRole = function(userId) {
  const participant = this.participants.find(p => p.userId === userId);
  return participant?.role || null;
};

// Method to update last message timestamp
chatSchema.methods.updateLastMessage = async function() {
  this.lastMessageAt = new Date();
  await this.save();
};

// Static method to find all chats for a user
chatSchema.statics.findByUserId = function(userId) {
  return this.find({ 
    'participants.userId': userId 
  }).sort({ lastMessageAt: -1 });
};

// Static method to find or create private chat
chatSchema.statics.findOrCreatePrivateChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    type: 'private',
    participants: { $all: [user1Id, user2Id] }
  });
  
  if (!chat) {
    chat = new this({
      type: 'private',
      participants: [
        { userId: user1Id, role: 'member' },
        { userId: user2Id, role: 'member' }
      ],
      createdBy: user1Id
    });
    await chat.save();
  }
  
  return chat;
};

export const Chat = mongoose.model('Chat', chatSchema);
