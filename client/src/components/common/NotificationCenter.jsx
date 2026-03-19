import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ne } from 'date-fns/locale';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to socket
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: { token: localStorage.getItem('token') }
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification server');
      });

      newSocket.on('NOTIFICATION', (data) => {
        handleNewNotification(data);
      });

      newSocket.on('DISPUTE_UPDATE', (data) => {
        handleDisputeUpdate(data);
      });

      setSocket(newSocket);

      // Fetch existing notifications
      fetchNotifications();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleNewNotification = (data) => {
    setNotifications(prev => [data, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast for urgent notifications
    if (data.urgent) {
      toast.custom((t) => (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="font-bold">{data.subject}</p>
          <p className="text-sm">{data.message}</p>
        </div>
      ));
    }
  };

  const handleDisputeUpdate = (data) => {
    toast.custom((t) => (
      <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg">
        <p className="font-bold">⚖️ Dispute Update</p>
        <p className="text-sm">{data.message}</p>
      </div>
    ));
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'DISPUTE_UPDATE':
        return '⚖️';
      case 'DOCUMENT_VERIFIED':
        return '✅';
      case 'APPOINTMENT_REMINDER':
        return '📅';
      case 'PAYMENT_SUCCESS':
        return '💰';
      default:
        return '📌';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-yellow-500 hover:text-yellow-600"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{notification.subject}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ne
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t text-center">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
