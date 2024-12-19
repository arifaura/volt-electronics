import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LocationMarkerIcon, 
  PhoneIcon, 
  MailIcon,
  ClockIcon 
} from '@heroicons/react/outline';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread',
        isArchived: false
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      toast.success('Message sent successfully! We will get back to you soon.');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Get in Touch
          </h2>
          <div className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Have questions about our services? We're here to help and would love to hear from you.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
              <div className="space-y-6">
                <div className="flex items-start">
                  <LocationMarkerIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold">Visit Us</p>
                    <p className="text-gray-600 mt-1">
                      123 Electric Avenue<br />
                      Circuit City, VT 12345
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold">Call Us</p>
                    <p className="text-gray-600 mt-1">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MailIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold">Email Us</p>
                    <p className="text-gray-600 mt-1">support@voltelectricals.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
              <div className="flex items-start mb-6">
                <ClockIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="text-gray-900 font-semibold">Business Hours</p>
                </div>
              </div>
              <div className="space-y-4">
                {businessHours.map(({ day, hours }) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-gray-600">{day}</span>
                    <span className="text-gray-900 font-medium">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none"
                      placeholder="Name"
                    />
                    <label 
                      htmlFor="name"
                      className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none"
                      placeholder="Email"
                    />
                    <label 
                      htmlFor="email"
                      className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Email
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none"
                    placeholder="Subject"
                  />
                  <label 
                    htmlFor="subject"
                    className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Subject
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none resize-none"
                    placeholder="Message"
                  />
                  <label 
                    htmlFor="message"
                    className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Message
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 