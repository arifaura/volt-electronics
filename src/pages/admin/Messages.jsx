import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { 
  MailIcon, 
  TrashIcon, 
  ArchiveIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, archived
  const location = useLocation();

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setMessages(newMessages);
      
      // If there's a selected message ID from navigation, select that message
      const selectedMessageId = location.state?.selectedMessageId;
      if (selectedMessageId) {
        const message = newMessages.find(m => m.id === selectedMessageId);
        if (message) {
          setSelectedMessage(message);
          // Clear the state to prevent reselection on subsequent renders
          window.history.replaceState({}, document.title);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [location]);

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return message.status === 'unread' && !message.isArchived;
    if (filter === 'archived') return message.isArchived;
    return !message.isArchived;
  });

  const handleMarkAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'read'
      });
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const handleArchive = async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        isArchived: true
      });
      toast.success('Message archived');
    } catch (error) {
      toast.error('Failed to archive message');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      toast.success('Message deleted');
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white rounded w-1/4"></div>
          <div className="h-64 bg-white rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredMessages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 text-center text-gray-500"
                  >
                    No messages found
                  </motion.div>
                ) : (
                  filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 cursor-pointer transition-colors duration-150 ease-in-out ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      } ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <MailIcon className={`h-6 w-6 ${
                            message.status === 'unread' ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              message.status === 'unread' ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {message.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {message.createdAt ? format(message.createdAt, 'MMM d, h:mm a') : 'Just now'}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {message.subject}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex space-x-2">
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark as Read
                      </button>
                    )}
                    {!selectedMessage.isArchived && (
                      <button
                        onClick={() => handleArchive(selectedMessage.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ArchiveIcon className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">From</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedMessage.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedMessage.email}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Message</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 