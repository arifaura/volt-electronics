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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

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
    <motion.div 
      className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-4xl font-bold text-text-primary sm:text-5xl"
            variants={itemVariants}
          >
            Get in Touch
          </motion.h2>
          <motion.div 
            className="mt-4 text-xl text-text-secondary max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Have questions about our services? We're here to help and would love to hear from you.
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
          >
            {/* Info Card */}
            <motion.div 
              className="bg-card-bg rounded-2xl shadow-xl p-8"
              variants={cardVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div className="space-y-6">
                {[
                  { icon: LocationMarkerIcon, title: "Visit Us", content: "123 Electric Avenue\nCircuit City, VT 12345" },
                  { icon: PhoneIcon, title: "Call Us", content: "+1 (555) 123-4567" },
                  { icon: MailIcon, title: "Email Us", content: "support@voltelectricals.com" }
                ].map((item, index) => (
                  <motion.div 
                    key={item.title}
                    className="flex items-start"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    custom={index}
                  >
                    <item.icon className="h-6 w-6 text-accent mt-1" />
                    <div className="ml-4">
                      <p className="text-text-primary font-semibold">{item.title}</p>
                      <p className="text-text-secondary mt-1 whitespace-pre-line">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Business Hours Card */}
            <motion.div 
              className="bg-card-bg rounded-2xl shadow-xl p-8"
              variants={cardVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div 
                className="flex items-start mb-6"
                variants={itemVariants}
              >
                <ClockIcon className="h-6 w-6 text-accent mt-1" />
                <div className="ml-4">
                  <p className="text-text-primary font-semibold">Business Hours</p>
                </div>
              </motion.div>
              <motion.div className="space-y-4">
                {businessHours.map((hour, index) => (
                  <motion.div 
                    key={hour.day}
                    className="flex justify-between items-center"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    custom={index}
                  >
                    <span className="text-text-secondary">{hour.day}</span>
                    <span className="text-text-primary font-medium">{hour.hours}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-2"
            variants={cardVariants}
          >
            <motion.div 
              className="bg-card-bg rounded-2xl shadow-xl p-8"
              whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.h3 
                className="text-2xl font-bold text-text-primary mb-8"
                variants={itemVariants}
              >
                Send us a Message
              </motion.h3>
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div 
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                  variants={itemVariants}
                >
                  {[
                    { name: 'name', type: 'text', label: 'Name' },
                    { name: 'email', type: 'email', label: 'Email' }
                  ].map((field) => (
                    <motion.div 
                      key={field.name}
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        required
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="peer w-full border-0 border-b-2 border-border bg-transparent py-2.5 px-0 text-text-primary placeholder-transparent focus:border-accent focus:outline-none"
                        placeholder={field.label}
                      />
                      <label 
                        htmlFor={field.name}
                        className="absolute left-0 -top-3.5 text-sm text-text-secondary transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-text-secondary peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-accent"
                      >
                        {field.label}
                      </label>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="peer w-full border-0 border-b-2 border-border bg-transparent py-2.5 px-0 text-text-primary placeholder-transparent focus:border-accent focus:outline-none"
                    placeholder="Subject"
                  />
                  <label 
                    htmlFor="subject"
                    className="absolute left-0 -top-3.5 text-sm text-text-secondary transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-text-secondary peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-accent"
                  >
                    Subject
                  </label>
                </motion.div>

                <motion.div 
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="peer w-full border-0 border-b-2 border-border bg-transparent py-2.5 px-0 text-text-primary placeholder-transparent focus:border-accent focus:outline-none resize-none"
                    placeholder="Message"
                  />
                  <label 
                    htmlFor="message"
                    className="absolute left-0 -top-3.5 text-sm text-text-secondary transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-text-secondary peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-accent"
                  >
                    Message
                  </label>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 