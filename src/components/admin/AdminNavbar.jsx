import React, { useState, useEffect, useRef } from 'react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  BellIcon, 
  SearchIcon, 
  UserCircleIcon,
  CogIcon,
  LogoutIcon,
  MailIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { playNotificationSound } from '../../utils/notificationSound';

export default function AdminNavbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    messages: [],
    orders: []
  });
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
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));

      // Check for new messages
      const previousMessageIds = new Set(previousNotificationsRef.current.messages.map(n => n.id));
      const newMessageNotifications = newMessages.filter(n => !previousMessageIds.has(n.id));

      if (newMessageNotifications.length > 0) {
        playNotificationSound();
        newMessageNotifications.forEach(message => {
          toast.success(`New message from ${message.name}`, {
            duration: 5000,
            icon: '✉️'
          });
        });
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
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));

      // Check for new orders
      const previousOrderIds = new Set(previousNotificationsRef.current.orders.map(n => n.id));
      const newOrderNotifications = newOrders.filter(n => !previousOrderIds.has(n.id));

      if (newOrderNotifications.length > 0) {
        playNotificationSound();
        newOrderNotifications.forEach(order => {
          toast.success(`New order #${order.id.slice(-6).toUpperCase()}`, {
            duration: 5000,
            icon: '🛍️'
          });
        });
      }

      setNotifications(prev => ({ ...prev, orders: newOrders }));
      previousNotificationsRef.current.orders = newOrders;
    });

    return () => {
      unsubscribeMessages();
      unsubscribeOrders();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (e, notification) => {
    e.stopPropagation();
    try {
      if (notification.type === 'message') {
        const notificationRef = doc(db, 'messages', notification.id);
        await updateDoc(notificationRef, {
          status: 'read'
        });
        toast.success('Message marked as read');
      } else if (notification.type === 'order') {
        const notificationRef = doc(db, 'orders', notification.id);
        await updateDoc(notificationRef, {
          status: 'processing'
        });
        toast.success('Order marked as processing');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update status');
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'message') {
      navigate('/admin/messages', { state: { selectedId: notification.id } });
    } else if (notification.type === 'order') {
      navigate('/admin/orders', { state: { selectedId: notification.id } });
    }
  };

  const allNotifications = [
    ...notifications.messages,
    ...notifications.orders
  ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="bg-card-bg shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Hamburger menu button */}
            <button
              onClick={toggleSidebar}
              className="px-2 -ml-2 md:hidden"
            >
              {isSidebarOpen ? (
                <XIcon className="h-6 w-6 text-text-primary" />
              ) : (
                <MenuIcon className="h-6 w-6 text-text-primary" />
              )}
            </button>
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-text-primary">Admin</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-text-primary hover:text-accent focus:outline-none"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-1 rounded-full text-text-primary hover:text-accent focus:outline-none">
                <BellIcon className="h-6 w-6" />
                {allNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-card-bg" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-card-bg ring-1 ring-border ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {allNotifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-secondary">
                        No new notifications
                      </div>
                    ) : (
                      allNotifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className={`${
                                active ? 'bg-background' : ''
                              } px-4 py-3 cursor-pointer`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  {notification.type === 'message' ? (
                                    <MailIcon className="h-5 w-5 text-accent mt-1" />
                                  ) : (
                                    <ShoppingCartIcon className="h-5 w-5 text-accent mt-1" />
                                  )}
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-text-primary">
                                      {notification.type === 'message'
                                        ? `Message from ${notification.name}`
                                        : `Order #${notification.id.slice(-6).toUpperCase()}`}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                      {notification.type === 'message'
                                        ? notification.subject
                                        : `${notification.items?.length || 0} items - $${notification.total?.toFixed(2) || '0.00'}`}
                                    </p>
                                    <p className="mt-1 text-xs text-text-secondary">
                                      {notification.createdAt ? format(notification.createdAt, 'MMM d, h:mm a') : 'Just now'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => markAsRead(e, notification)}
                                  className="ml-3 text-sm text-accent hover:text-accent-hover"
                                >
                                  Mark as read
                                </button>
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Profile Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-text-primary hover:text-accent">
                <UserCircleIcon className="h-8 w-8" />
                <span className="text-sm font-medium">{user?.name}</span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card-bg ring-1 ring-border ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-background' : ''
                          } flex w-full px-4 py-2 text-sm text-text-primary`}
                        >
                          <LogoutIcon className="h-5 w-5 mr-2" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
} 