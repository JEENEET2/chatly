export function initializeWebSocket(io) {
  // Map to store user socket connections
  const userSockets = new Map();
  const chatRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join user's personal room for direct messages
    socket.on('user:join', (userId) => {
      socket.join(`user:${userId}`);
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} joined personal room`);
      
      // Update user online status
      io.emit('user:online', { userId, isOnline: true });
    });

    // Join chat room
    socket.on('chat:join', ({ userId, chatId }) => {
      socket.join(`chat:${chatId}`);
      
      if (!chatRooms.has(chatId)) {
        chatRooms.set(chatId, new Set());
      }
      chatRooms.get(chatId).add(socket.id);
      
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('chat:leave', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
      
      if (chatRooms.has(chatId)) {
        chatRooms.get(chatId).delete(socket.id);
      }
      
      console.log(`Left chat ${chatId}`);
    });

    // Send message
    socket.on('message:send', (data) => {
      const { chatId, message } = data;
      
      // Broadcast to all in chat room
      socket.to(`chat:${chatId}`).emit('message:new', message);
      
      // Also send to sender's other devices
      socket.emit('message:sent', { message });
    });

    // Typing indicator
    socket.on('typing:start', ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        userId,
        timestamp: Date.now()
      });
    });

    socket.on('typing:stop', ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        userId
      });
    });

    // Message read receipt
    socket.on('message:read', ({ chatId, messageId, userId }) => {
      socket.to(`chat:${chatId}`).emit('message:read', {
        chatId,
        messageId,
        userId,
        timestamp: Date.now()
      });
    });

    // User presence
    socket.on('presence:update', ({ userId, isOnline, lastSeen }) => {
      socket.broadcast.emit('user:presence', {
        userId,
        isOnline,
        lastSeen: isOnline ? null : lastSeen
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      
      // Remove from user sockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          io.emit('user:offline', { userId, lastSeen: new Date() });
          break;
        }
      }
      
      // Remove from chat rooms
      for (const [chatId, sockets] of chatRooms.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          chatRooms.delete(chatId);
        }
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now();
    // Add cleanup logic here if needed
  }, 60000); // Every minute

  console.log('✅ WebSocket handler initialized');
  
  return { io, userSockets, chatRooms };
}

export default initializeWebSocket;
