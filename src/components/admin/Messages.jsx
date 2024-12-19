import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import { 
  MailIcon, 
  MailOpenIcon,
  ArchiveIcon,
  ReplyIcon 
} from '@heroicons/react/outline';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString()
      }));
      
      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'read'
      });
      await fetchMessages();
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleArchive = async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        isArchived: true
      });
      await fetchMessages();
      toast.success('Message archived');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Failed to archive message');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Messages</h2>
          <div className="flex space-x-4">
            <button
              onClick={fetchMessages}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li 
                  key={message.id}
                  className={`hover:bg-gray-50 ${
                    message.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.name} ({message.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          {message.subject}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {message.createdAt}
                        </span>
                        {message.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(message.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <MailOpenIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(message.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <ArchiveIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => window.location.href = `mailto:${message.email}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          <ReplyIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 