const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notificationService');

const setupSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Get initial notifications
    socket.on('get_notifications', async () => {
      const notifications = await getUserNotifications(socket.userId);
      socket.emit('notifications', notifications);
    });

    // Mark notification as read
    socket.on('mark_read', async (notificationId) => {
      await markAsRead(notificationId);
    });

    // Mark all notifications as read
    socket.on('mark_all_read', async () => {
      await markAllAsRead(socket.userId);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;