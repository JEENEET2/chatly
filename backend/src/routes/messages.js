import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../models/Message.js';
import { Chat } from '../models/Chat.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mp3|wav|pdf|doc|docx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * GET /api/v1/messages/:chatId
 * Get messages for a chat with pagination
 */
router.get('/:chatId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { limit = 50, before, after } = req.query;

    // Verify user is participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      'participants.userId': userId 
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    let query = { chatId, isDeleted: false };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('senderId', 'firstName lastName avatarUrl username isOnline')
      .populate('content.forwardFromUserId', 'firstName lastName username');

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id,
        chatId: msg.chatId,
        sender: {
          id: msg.senderId._id,
          firstName: msg.senderId.firstName,
          lastName: msg.senderId.lastName,
          avatarUrl: msg.senderId.avatarUrl,
          username: msg.senderId.username,
          isOnline: msg.senderId.isOnline
        },
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        isEdited: msg.isEdited,
        reactions: msg.reactions,
        replyCount: 0, // Would be calculated
        views: msg.views,
        deliveryStatus: msg.deliveryStatus
      })).reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/messages
 * Send a new message
 */
router.post('/', authenticate, [
  body('chatId').notEmpty().withMessage('Chat ID is required'),
  body('content.text').optional().isLength({ max: 4096 }).withMessage('Text too long'),
  body('content.replyToMessageId').optional().isString(),
  body('content.caption').optional().isLength({ max: 1024 }).withMessage('Caption too long')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { chatId, content } = req.body;

    // Verify user is participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      'participants.userId': userId 
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if only admins can post
    if (chat.settings.onlyAdminsCanPost) {
      const participant = chat.participants.find(p => p.userId === userId);
      if (!['owner', 'admin'].includes(participant.role)) {
        return res.status(403).json({ error: 'Only admins can post in this chat' });
      }
    }

    // Check slow mode
    if (chat.settings.slowModeDelay > 0) {
      const lastMessage = await Message.findOne({
        chatId,
        senderId: userId
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        const timeSinceLastMessage = Date.now() - lastMessage.createdAt.getTime();
        if (timeSinceLastMessage < chat.settings.slowModeDelay * 1000) {
          const waitTime = Math.ceil((chat.settings.slowModeDelay * 1000 - timeSinceLastMessage) / 1000);
          return res.status(429).json({ 
            error: 'Slow mode active',
            waitTime 
          });
        }
      }
    }

    const message = new Message({
      chatId,
      senderId: userId,
      content: {
        text: content.text || '',
        media: content.media || [],
        replyToMessageId: content.replyToMessageId,
        caption: content.caption
      },
      type: content.media?.length > 0 ? 'media' : 'text'
    });

    await message.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 }
    });

    // Emit WebSocket event (would be handled by socket.io)
    // io.to(chatId).emit('message:new', message);

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        chatId: message.chatId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        deliveryStatus: message.deliveryStatus
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/messages/upload
 * Upload media file
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.split('/')[0];
    
    const mediaTypeMap = {
      image: 'photo',
      video: 'video',
      audio: 'audio',
      application: 'document'
    };

    res.json({
      success: true,
      media: {
        type: mediaTypeMap[fileType] || 'document',
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/messages/:messageId
 * Edit a message
 */
router.put('/:messageId', authenticate, [
  body('content.text').optional().isLength({ max: 4096 }).withMessage('Text too long')
], async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({ 
      _id: messageId,
      senderId: userId 
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if message can be edited (within time limit)
    const timeSinceSent = Date.now() - message.createdAt.getTime();
    if (timeSinceSent > 48 * 60 * 60 * 1000) { // 48 hours
      return res.status(400).json({ error: 'Message can only be edited within 48 hours' });
    }

    if (content.text !== undefined) {
      message.content.text = content.text;
    }
    
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    res.json({
      success: true,
      message: 'Message edited successfully',
      editedAt: message.editedAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    const { forEveryone = false } = req.query;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check permissions
    const canDelete = message.senderId.toString() === userId || forEveryone;
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Cannot delete this message' });
    }

    if (forEveryone) {
      message.isDeleted = true;
      message.content = { text: '[Message deleted]' };
    } else {
      // Delete only for sender
      message.isDeleted = true;
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/messages/:messageId/reactions
 * Add reaction to message
 */
router.post('/:messageId/reactions', authenticate, [
  body('emoji').notEmpty().withMessage('Emoji is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.addReaction(userId, emoji);

    res.json({
      success: true,
      message: 'Reaction added'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/messages/:messageId/read
 * Mark message as read
 */
router.put('/:messageId/read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.markAsRead(userId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
