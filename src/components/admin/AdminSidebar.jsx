import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  CogIcon,
  MailIcon
} from '@heroicons/react/outline';
import { motion } from 'framer-motion';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Messages', href: '/admin/messages', icon: MailIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 768) { // Only close on mobile
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static
        inset-y-0 left-0
        z-30
        transition-transform duration-300 ease-in-out
        flex flex-col w-64
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <Link 
              to="/admin/dashboard" 
              className="text-white font-bold text-xl"
              onClick={handleNavClick}
            >
              Admin Panel
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.href}
                      onClick={handleNavClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 