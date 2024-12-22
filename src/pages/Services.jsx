import { useState } from 'react';
import { 
  LightningBoltIcon, 
  HomeIcon, 
  SupportIcon, 
  CogIcon 
} from '@heroicons/react/outline';
import { motion } from 'framer-motion';
import ContactModal from '../components/services/ContactModal';

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

export default function Services() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      name: 'Electrical Installation',
      description: 'Professional installation of electrical systems and components for your home or business.',
      icon: LightningBoltIcon,
    },
    {
      name: 'Smart Home Solutions',
      description: 'Transform your home with our cutting-edge smart electrical solutions.',
      icon: HomeIcon,
    },
    {
      name: 'Technical Support',
      description: '24/7 technical support for all your electrical product needs.',
      icon: SupportIcon,
    },
    {
      name: 'Maintenance Services',
      description: 'Regular maintenance and repair services to keep your electrical systems running smoothly.',
      icon: CogIcon,
    },
  ];

  const handleContactSubmit = (data) => {
    // Here you would typically send the data to your backend
    console.log('Contact form submitted:', data);
    // You could also show a success message
    alert('Thank you for your interest! We will contact you soon.');
  };

  return (
    <motion.div 
      className="bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            variants={itemVariants}
          >
            Our Services
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-500"
            variants={itemVariants}
          >
            Comprehensive electrical solutions for your needs
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-16"
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {services.map((service, index) => (
              <motion.div 
                key={service.name} 
                className="pt-6"
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                custom={index}
              >
                <motion.div 
                  className="flow-root rounded-lg bg-gray-50 px-6 pb-8"
                  whileHover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                >
                  <div className="-mt-6">
                    <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                      <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                    <motion.h3 
                      className="mt-8 text-lg font-medium tracking-tight text-gray-900"
                      variants={itemVariants}
                    >
                      {service.name}
                    </motion.h3>
                    <motion.p 
                      className="mt-5 text-base text-gray-500"
                      variants={itemVariants}
                    >
                      {service.description}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 bg-blue-50 rounded-lg p-8"
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
        >
          <motion.h3 
            className="text-2xl font-bold text-gray-900"
            variants={itemVariants}
          >
            Need Custom Services?
          </motion.h3>
          <motion.p 
            className="mt-4 text-lg text-gray-500"
            variants={itemVariants}
          >
            Contact us to discuss your specific requirements. We offer customized solutions
            tailored to your needs.
          </motion.p>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get in Touch
          </motion.button>
        </motion.div>

        <ContactModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          onSubmit={handleContactSubmit}
        />
      </div>
    </motion.div>
  );
} 