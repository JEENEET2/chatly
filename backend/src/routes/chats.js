import { Router } from 'express';
import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = Router();

/**
 * GET /api/v1/chats
 * Get all chats for current user
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const chats = await Chat.find({ 
      'participants.userId': userId 
    })
    .sort({ lastMessageAt: -1 })
    .populate('participants.userId', 'firstName lastName avatarUrl username isOnline lastSeen')
    .populate('createdBy', 'firstName lastName username');

    res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat._id,
        type: chat.type,
        name: chat.name,
        description: chat.description,
        avatarUrl: chat.avatarUrl,
        participantCount: chat.participants.length,
        lastMessageAt: chat.lastMessageAt,
        messageCount: chat.messageCount,
        pinnedMessageIds: chat.pinnedMessageIds,
        settings: chat.settings,
        createdBy: chat.createdBy ? {
          id: chat.createdBy._id,
          firstName: chat.createdBy.firstName,
          lastName: chat.createdBy.lastName,
          username: chat.createdBy.username
        } : null,
        unreadCount: 0 // Would be calculated from messages collection
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/chats
 * Create new chat (group or channel)
 */
router.post('/', authenticate, [
  body('type').isIn(['group', 'channel']).withMessage('Type must be group or channel'),
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description must be under 255 characters'),
  body('participantIds').optional().isArray().withMessage('Participant IDs must be an array')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { type, name, description, participantIds = [] } = req.body;

    // Validate participants exist
    if (participantIds.length > 0) {
      const users = await User.find({ _id: { $in: participantIds } });
      if (users.length !== participantIds.length) {
        return res.status(400).json({ error: 'Some participants not found' });
      }
    }

    const participants = [
      { userId, role: 'owner' },
      ...participantIds.filter(id => id !== userId).map(id => ({ userId: id, role: 'member' }))
    ];

    const chat = new Chat({
      type,
      name,
      description,
      participants,
      createdBy: userId
    });

    await chat.save();

    res.status(201).json({
      success: true,
      chat: {
        id: chat._id,
        type: chat.type,
        name: chat.name,
        description: chat.description,
        participantCount: chat.participants.length,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/chats/:chatId
 * Get single chat details
 */
router.get('/:chatId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;

    const chat = await Chat.findOne({ 
      _id: chatId,
      'participants.userId': userId 
    })
    .populate('participants.userId', 'firstName lastName avatarUrl username isOnline lastSeen')
    .populate('createdBy', 'firstName lastName username');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        type: chat.type,
        name: chat.name,
        description: chat.description,
        avatarUrl: chat.avatarUrl,
        participants: chat.participants.map(p => ({
          id: p.userId._id,
          firstName: p.userId.firstName,
          lastName: p.userId.lastName,
          username: p.userId.username,
          avatarUrl: p.userId.avatarUrl,
          isOnline: p.userId.isOnline,
          lastSeen: p.userId.lastSeen,
          role: p.role,
          joinedAt: p.joinedAt,
          isMuted: p.isMuted
        })),
        settings: chat.settings,
        createdBy: chat.createdBy ? {
          id: chat.createdBy._id,
          firstName: chat.createdBy.firstName,
          lastName: chat.createdBy.lastName,
          username: chat.createdBy.username
        } : null,
        createdAt: chat.createdAt,
        lastMessageAt: chat.lastMessageAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/chats/:chatId
 * Update chat settings
 */
router.put('/:chatId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { name, description, avatarUrl, settings } = req.body;

    const chat = await Chat.findOne({ 
      _id: chatId,
      'participants.userId': userId 
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check permissions
    const participant = chat.participants.find(p => p.userId === userId);
    if (!['owner', 'admin'].includes(participant.role)) {
      return res.status(403).json({ error: 'Not enough permissions' });
    }

    if (name !== undefined) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (avatarUrl !== undefined) chat.avatarUrl = avatarUrl;
    if (settings !== undefined) {
      chat.settings = { ...chat.settings, ...settings };
    }

    await chat.save();

    res.json({
      success: true,
      message: 'Chat updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/chats/:chatId
 * Leave or delete chat
 */
router.delete('/:chatId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const participantIndex = chat.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Not a participant' });
    }

    const participant = chat.participants[participantIndex];
    
    if (participant.role === 'owner') {
      // Transfer ownership or delete chat
      if (chat.participants.length > 1) {
        // Transfer to first admin or member
        const newOwner = chat.participants.find(p => p.userId !== userId);
        if (newOwner) {
          newOwner.role = 'owner';
        }
        chat.participants.splice(participantIndex, 1);
        await chat.save();
      } else {
        await Chat.findByIdAndDelete(chatId);
      }
    } else {
      chat.participants.splice(participantIndex, 1);
      await chat.save();
    }

    res.json({
      success: true,
      message: 'Successfully left chat'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/chats/:chatId/participants
 * Add participants to chat
 */
router.post('/:chatId/participants', authenticate, [
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('userIds.*').notEmpty().withMessage('User ID cannot be empty')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { chatId } = req.params;
    const { userIds } = req.body;

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check permissions
    const participant = chat.participants.find(p => p.userId === userId);
    if (!['owner', 'admin'].includes(participant.role)) {
      return res.status(403).json({ error: 'Not enough permissions' });
    }

    // Validate users exist and add them
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'Some users not found' });
    }

    const existingIds = chat.participants.map(p => p.userId);
    const newParticipants = users
      .filter(u => !existingIds.includes(u._id))
      .map(u => ({ userId: u._id, role: 'member' }));

    if (newParticipants.length > 0) {
      chat.participants.push(...newParticipants);
      await chat.save();
    }

    res.json({
      success: true,
      addedCount: newParticipants.length,
      message: `${newParticipants.length} participant(s) added`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
