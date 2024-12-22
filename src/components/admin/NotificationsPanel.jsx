import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BellIcon, MailIcon, CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { playNotificationSound } from '../../utils/notificationSound';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState({
    messages: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const previousNotificationsRef = useRef({ messages: [], orders: [] });

  useEffect(() => {
    // Query for unread messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('status', '==', 'unread'),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    // Query for new orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    // Subscribe to messages updates
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'message',
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Check for new messages
      const previousMessageIds = new Set(previousNotificationsRef.current.messages.map(n => n.id));
      const newMessageNotifications = newMessages.filter(n => !previousMessageIds.has(n.id));

      if (newMessageNotifications.length > 0) {
        playNotificationSound();
        newMessageNotifications.forEach(message => showNotification(message));
      }

      setNotifications(prev => ({ ...prev, messages: newMessages }));
      previousNotificationsRef.current.messages = newMessages;
    });

    // Subscribe to orders updates
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'order',
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Check for new orders
      const previousOrderIds = new Set(previousNotificationsRef.current.orders.map(n => n.id));
      const newOrderNotifications = newOrders.filter(n => !previousOrderIds.has(n.id));

      if (newOrderNotifications.length > 0) {
        playNotificationSound();
        newOrderNotifications.forEach(order => showNotification(order));
      }

      setNotifications(prev => ({ ...prev, orders: newOrders }));
      previousNotificationsRef.current.orders = newOrders;
      setLoading(false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeOrders();
    };
  }, [navigate]);

  const showNotification = (notification) => {
    const isMessage = notification.type === 'message';
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
      >
        <div className="flex-1 w-0 p-4" onClick={() => {
          navigate(isMessage ? '/admin/messages' : '/admin/orders', {
            state: { selectedId: notification.id }
          });
          toast.dismiss(t.id);
        }}>
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {isMessage ? (
                <MailIcon className="h-10 w-10 text-blue-500" />
              ) : (
                <ShoppingCartIcon className="h-10 w-10 text-green-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {isMessage 
                  ? `New message from ${notification.name}`
                  : `New order #${notification.id.slice(-6)}`
                }
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isMessage 
                  ? notification.subject
                  : `${notification.items?.length || 0} items - $${notification.total?.toFixed(2) || '0.00'}`
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right',
    });
  };

  const markAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      const notificationRef = doc(db, 'messages', notificationId);
      await updateDoc(notificationRef, {
        status: 'read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewAll = (type) => {
    navigate(type === 'messages' ? '/admin/messages' : '/admin/orders');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const allNotifications = [
    ...notifications.messages.map(msg => ({ ...msg, type: 'message' })),
    ...notifications.orders.map(order => ({ ...order, type: 'order' }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      {/* Messages Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <MailIcon className="h-5 w-5 text-blue-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Recent Messages</h3>
          </div>
          <div className="flex items-center space-x-4">
            {notifications.messages.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {notifications.messages.length} new
              </span>
            )}
            <button
              onClick={() => handleViewAll('messages')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {notifications.messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-gray-500"
              >
                No new messages
              </motion.div>
            ) : (
              notifications.messages.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => navigate('/admin/messages', { state: { selectedMessageId: notification.id } })}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MailIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.createdAt ? format(notification.createdAt, 'MMM d, h:mm a') : 'Just now'}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.subject}
                      </p>
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={(e) => markAsRead(e, notification.id)}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Mark as read
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-5 w-5 text-green-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="flex items-center space-x-4">
            {notifications.orders.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {notifications.orders.length} new
              </span>
            )}
            <button
              onClick={() => handleViewAll('orders')}
              className="text-sm text-green-600 hover:text-green-800"
            >
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {notifications.orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-gray-500"
              >
                No new orders
              </motion.div>
            ) : (
              notifications.orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => navigate('/admin/orders', { state: { selectedOrderId: order.id } })}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ShoppingCartIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt ? format(order.createdAt, 'MMM d, h:mm a') : 'Just now'}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.items?.length || 0} items - ${order.total?.toFixed(2) || '0.00'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Status: <span className="text-green-600 font-medium">{order.status}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 