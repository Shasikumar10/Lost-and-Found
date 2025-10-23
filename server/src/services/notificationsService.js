const Notification = require('../models/Notification');

// Send notification
const sendNotification = async (io, userId, type, title, message, relatedItem = null, relatedClaim = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedItem,
      relatedClaim
    });

    // Emit socket event for real-time notification
    io.to(userId.toString()).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Get user notifications
const getUserNotifications = async (userId, limit = 20) => {
  try {
    const notifications = await Notification.find({ userId })
      .populate('relatedItem', 'title type')
      .populate('relatedClaim')
      .sort({ createdAt: -1 })
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};