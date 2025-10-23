import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      newSocket.emit('get_notifications');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.title, {
        duration: 4000,
        icon: '🔔'
      });
    });

    newSocket.on('notifications', (notifs) => {
      setNotifications(notifs);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark_read', notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit('mark_all_read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    }
  };

  return {
    socket,
    connected,
    notifications,
    markAsRead,
    markAllAsRead
  };
};