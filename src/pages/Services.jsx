import { useState } from 'react';
import { 
  LightningBoltIcon, 
  HomeIcon, 
  SupportIcon, 
  CogIcon 
} from '@heroicons/react/outline';
import ContactModal from '../components/services/ContactModal';

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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Comprehensive electrical solutions for your needs
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {services.map((service) => (
              <div key={service.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                        <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      {service.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900">Need Custom Services?</h3>
          <p className="mt-4 text-lg text-gray-500">
            Contact us to discuss your specific requirements. We offer customized solutions
            tailored to your needs.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Get in Touch
          </button>
        </div>

        <ContactModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          onSubmit={handleContactSubmit}
        />
      </div>
    </div>
  );
} 